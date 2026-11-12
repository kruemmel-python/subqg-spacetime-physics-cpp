#include "subqg/canonical_runtime.hpp"

#include <mutex>
#include <stdexcept>
#include <utility>
#include <vector>

#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#else
#error CanonicalRuntime currently requires Windows, matching the supplied KR Windows toolchain.
#endif

namespace subqg {
namespace {

std::wstring widen(const std::string& text) {
    if (text.empty()) return {};
    int n=MultiByteToWideChar(CP_UTF8,0,text.data(),static_cast<int>(text.size()),nullptr,0);
    if(n<=0) throw std::runtime_error("UTF-8 to UTF-16 conversion failed");
    std::wstring out(static_cast<std::size_t>(n),L'\0');
    MultiByteToWideChar(CP_UTF8,0,text.data(),static_cast<int>(text.size()),out.data(),n);
    return out;
}

std::wstring quote(const std::wstring& value) {
    std::wstring out=L"\"";
    std::size_t slashes=0;
    for(wchar_t c:value){
        if(c==L'\\'){++slashes;continue;}
        if(c==L'\"'){out.append(slashes*2+1,L'\\');out.push_back(c);slashes=0;continue;}
        out.append(slashes,L'\\');slashes=0;out.push_back(c);
    }
    out.append(slashes*2,L'\\');out.push_back(L'\"');return out;
}

std::string jsonString(const std::string& value){
    std::string out="\"";
    static const char hex[]="0123456789abcdef";
    for(unsigned char c:value){switch(c){case '\"':out+="\\\"";break;case '\\':out+="\\\\";break;case '\b':out+="\\b";break;case '\f':out+="\\f";break;case '\n':out+="\\n";break;case '\r':out+="\\r";break;case '\t':out+="\\t";break;default:if(c<0x20){out+="\\u00";out+=hex[c>>4];out+=hex[c&15];}else out+=static_cast<char>(c);}}out+='\"';return out;
}

std::string valueFromEnvelope(const std::string& response){
    if(response.find("\"ok\":false")!=std::string::npos){
        auto p=response.find("\"error\":");
        throw std::runtime_error(p==std::string::npos?response:response.substr(p+8,response.size()-p-9));
    }
    auto p=response.find("\"value\":");
    if(p==std::string::npos||response.empty()||response.back()!='}')throw std::runtime_error("Malformed canonical runtime response: "+response);
    return response.substr(p+8,response.size()-(p+8)-1);
}

}

struct CanonicalRuntime::Impl {
    HANDLE process=nullptr,thread=nullptr,stdinWrite=nullptr,stdoutRead=nullptr;
    std::uint64_t nextId=1;
    std::mutex mutex;

    explicit Impl(const CanonicalRuntimeConfig& cfg){
        if(cfg.developerRoot.empty()||cfg.bridgeScript.empty())throw std::invalid_argument("developerRoot and bridgeScript are required");
        SECURITY_ATTRIBUTES sa{sizeof(SECURITY_ATTRIBUTES),nullptr,TRUE};
        HANDLE childStdoutWrite=nullptr,childStdinRead=nullptr;
        if(!CreatePipe(&stdoutRead,&childStdoutWrite,&sa,0)||!SetHandleInformation(stdoutRead,HANDLE_FLAG_INHERIT,0))throw std::runtime_error("Cannot create canonical stdout pipe");
        if(!CreatePipe(&childStdinRead,&stdinWrite,&sa,0)||!SetHandleInformation(stdinWrite,HANDLE_FLAG_INHERIT,0)){CloseHandle(stdoutRead);CloseHandle(childStdoutWrite);throw std::runtime_error("Cannot create canonical stdin pipe");}
        STARTUPINFOW si{};si.cb=sizeof(si);si.dwFlags=STARTF_USESTDHANDLES;si.hStdInput=childStdinRead;si.hStdOutput=childStdoutWrite;si.hStdError=GetStdHandle(STD_ERROR_HANDLE);
        PROCESS_INFORMATION pi{};
        std::wstring node=widen(cfg.nodeExecutable),bridge=widen(cfg.bridgeScript),root=widen(cfg.developerRoot);
        std::wstring command=quote(node)+L" "+quote(bridge)+L" "+quote(root);
        std::vector<wchar_t> mutableCommand(command.begin(),command.end());mutableCommand.push_back(L'\0');
        std::wstring cwd=widen(cfg.developerRoot);
        BOOL ok=CreateProcessW(node.c_str(),mutableCommand.data(),nullptr,nullptr,TRUE,CREATE_NO_WINDOW,nullptr,cwd.c_str(),&si,&pi);
        CloseHandle(childStdinRead);CloseHandle(childStdoutWrite);
        if(!ok){CloseHandle(stdinWrite);CloseHandle(stdoutRead);stdinWrite=stdoutRead=nullptr;throw std::runtime_error("Cannot start canonical Node runtime (Win32 "+std::to_string(GetLastError())+")");}
        process=pi.hProcess;thread=pi.hThread;
    }

    ~Impl(){stop();}
    bool running()const noexcept {return process&&WaitForSingleObject(process,0)==WAIT_TIMEOUT;}
    std::string request(const std::string& body){
        std::lock_guard<std::mutex> lock(mutex);
        if(!running())throw std::runtime_error("Canonical runtime is not running");
        std::string message="{\"id\":"+std::to_string(nextId++)+","+body+"}\n";
        DWORD written=0;if(!WriteFile(stdinWrite,message.data(),static_cast<DWORD>(message.size()),&written,nullptr)||written!=message.size())throw std::runtime_error("Cannot write canonical runtime request");
        std::string response;char ch;DWORD read=0;
        for(;;){if(!ReadFile(stdoutRead,&ch,1,&read,nullptr)||read!=1)throw std::runtime_error("Canonical runtime closed its output");if(ch=='\n')break;if(ch!='\r')response.push_back(ch);if(response.size()>128*1024*1024)throw std::runtime_error("Canonical runtime response exceeds 128 MiB");}
        return valueFromEnvelope(response);
    }
    void stop() noexcept {
        if(process){
            if(running()){try{request("\"op\":\"shutdown\"");}catch(...){}WaitForSingleObject(process,2000);if(running())TerminateProcess(process,0);}
            CloseHandle(process);process=nullptr;
        }
        if(thread){CloseHandle(thread);thread=nullptr;}if(stdinWrite){CloseHandle(stdinWrite);stdinWrite=nullptr;}if(stdoutRead){CloseHandle(stdoutRead);stdoutRead=nullptr;}
    }
};

CanonicalRuntime::CanonicalRuntime(CanonicalRuntimeConfig c):impl_(std::make_unique<Impl>(c)){}
CanonicalRuntime CanonicalRuntime::bundled(const std::string& root){
    std::string base=root;while(!base.empty()&&(base.back()=='\\'||base.back()=='/'))base.pop_back();
    return CanonicalRuntime({base+"\\bin\\node.exe",base+"\\share\\subqg\\developer",base+"\\share\\subqg\\runtime\\subqg_bridge.mjs"});
}
CanonicalRuntime::~CanonicalRuntime()=default;
CanonicalRuntime::CanonicalRuntime(CanonicalRuntime&&) noexcept=default;
CanonicalRuntime& CanonicalRuntime::operator=(CanonicalRuntime&&) noexcept=default;
bool CanonicalRuntime::running()const noexcept{return impl_&&impl_->running();}
std::string CanonicalRuntime::inventory(){return impl_->request("\"op\":\"inventory\"");}
std::string CanonicalRuntime::invoke(const std::string&m,const std::string&e,const std::string&a){return impl_->request("\"op\":\"invoke\",\"module\":"+jsonString(m)+",\"export\":"+jsonString(e)+",\"args\":"+(a.empty()?"[]":a));}
std::uint64_t CanonicalRuntime::construct(const std::string&m,const std::string&e,const std::string&a){std::string v=impl_->request("\"op\":\"construct\",\"module\":"+jsonString(m)+",\"export\":"+jsonString(e)+",\"args\":"+(a.empty()?"[]":a));auto p=v.find("\"handle\":");if(p==std::string::npos)throw std::runtime_error("Construct did not return a handle");return std::stoull(v.substr(p+9));}
std::string CanonicalRuntime::call(std::uint64_t h,const std::string&m,const std::string&a){return impl_->request("\"op\":\"call\",\"handle\":"+std::to_string(h)+",\"method\":"+jsonString(m)+",\"args\":"+(a.empty()?"[]":a));}
std::string CanonicalRuntime::get(std::uint64_t h,const std::string&p){return impl_->request("\"op\":\"get\",\"handle\":"+std::to_string(h)+",\"property\":"+jsonString(p));}
void CanonicalRuntime::destroy(std::uint64_t h){(void)impl_->request("\"op\":\"destroy\",\"handle\":"+std::to_string(h));}
void CanonicalRuntime::stop(){if(impl_)impl_->stop();}

}
