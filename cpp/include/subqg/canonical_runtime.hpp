#pragma once

#include "physics.hpp"
#include <cstdint>
#include <memory>
#include <string>

namespace subqg {

struct SUBQG_API CanonicalRuntimeConfig {
    std::string nodeExecutable = "node.exe";
    std::string developerRoot;
    std::string bridgeScript;
};

/**
 * Executes the authoritative FPV6 developer/src implementation behind a C++
 * API. Arguments and return values use JSON so every canonical module can be
 * exposed without translating or approximating its equations.
 */
class SUBQG_API CanonicalRuntime {
public:
    explicit CanonicalRuntime(CanonicalRuntimeConfig config);
    static CanonicalRuntime bundled(const std::string& packageRoot);
    ~CanonicalRuntime();
    CanonicalRuntime(const CanonicalRuntime&) = delete;
    CanonicalRuntime& operator=(const CanonicalRuntime&) = delete;
    CanonicalRuntime(CanonicalRuntime&&) noexcept;
    CanonicalRuntime& operator=(CanonicalRuntime&&) noexcept;

    bool running() const noexcept;
    std::string inventory();
    std::string invoke(const std::string& module,const std::string& exportedFunction,const std::string& jsonArguments="[]");
    std::uint64_t construct(const std::string& module,const std::string& exportedClass,const std::string& jsonArguments="[]");
    std::string call(std::uint64_t handle,const std::string& method,const std::string& jsonArguments="[]");
    std::string get(std::uint64_t handle,const std::string& property);
    void destroy(std::uint64_t handle);
    void stop();

private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

}
