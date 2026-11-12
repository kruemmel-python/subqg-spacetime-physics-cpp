#pragma once

/**
 * SubQG Physics Engine - Header-Only C++ Client (C++17 / C++20)
 * ==============================================================
 * 
 * Ermöglicht die nahtlose Einbindung der SubQG Physics Engine in jede beliebige
 * eigene C++ Game Engine (z.B. Raylib, SDL3, Vulkan/DirectX, Custom Renderer).
 * 
 * Plattformunabhängig: Unterstützt Windows (Winsock2) und Linux/macOS (POSIX Sockets).
 * Keine externen Abhängigkeiten (Zero-Dependency).
 */

#include <string>
#include <vector>
#include <sstream>
#include <iostream>
#include <cstring>

#if defined(_WIN32) || defined(_WIN64)
    #define SUBQG_PLATFORM_WINDOWS
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
#else
    #define SUBQG_PLATFORM_POSIX
    #include <sys/types.h>
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
#endif

namespace SubQG {

struct BodyState {
    std::string id;
    std::string type;
    float x = 0.0f;
    float y = 0.0f;
    float angle = 0.0f;
    float angleDeg = 0.0f;
    float vx = 0.0f;
    float vy = 0.0f;
    float w = 0.0f;
    bool isSleeping = false;
};

struct WorldSnapshot {
    int bodyCount = 0;
    int jointCount = 0;
    int brokenJoints = 0;
    std::vector<BodyState> bodies;
};

class Client {
public:
    Client() {
#ifdef SUBQG_PLATFORM_WINDOWS
        WSADATA wsaData;
        WSAStartup(MAKEWORD(2, 2), &wsaData);
#endif
    }

    ~Client() {
        disconnect();
#ifdef SUBQG_PLATFORM_WINDOWS
        WSACleanup();
#endif
    }

    bool connect(const std::string& host = "127.0.0.1", int port = 3001) {
        disconnect();

#ifdef SUBQG_PLATFORM_WINDOWS
        m_socket = ::socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (m_socket == INVALID_SOCKET) return false;
#else
        m_socket = ::socket(AF_INET, SOCK_STREAM, 0);
        if (m_socket < 0) return false;
#endif

        sockaddr_in serverAddr{};
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_port = htons(port);
        inet_pton(AF_INET, host.c_str(), &serverAddr.sin_addr);

        if (::connect(m_socket, (struct sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
            disconnect();
            return false;
        }

        m_connected = true;
        return true;
    }

    void disconnect() {
        if (m_connected) {
#ifdef SUBQG_PLATFORM_WINDOWS
            closesocket(m_socket);
            m_socket = INVALID_SOCKET;
#else
            ::close(m_socket);
            m_socket = -1;
#endif
            m_connected = false;
        }
    }

    bool isConnected() const { return m_connected; }

    bool createWorld(const std::string& engineMode = "pure-subqg", float gx = 0.0f, float gy = -9.81f) {
        std::ostringstream ss;
        ss << "{\"method\":\"create_world\",\"params\":{\"engineMode\":\"" << engineMode 
           << "\",\"gravity\":[" << gx << "," << gy << "]}}";
        std::string res;
        return sendCommand(ss.str(), res);
    }

    bool createBox(const std::string& id, float x, float y, float width, float height, 
                   bool isDynamic = true, bool isDestructible = false, float fractureForce = 350.0f) {
        std::ostringstream ss;
        ss << "{\"method\":\"create_box\",\"params\":{\"id\":\"" << id 
           << "\",\"x\":" << x << ",\"y\":" << y 
           << ",\"width\":" << width << ",\"height\":" << height 
           << ",\"type\":\"" << (isDynamic ? "dynamic" : "static") 
           << "\",\"isDestructible\":" << (isDestructible ? "true" : "false")
           << ",\"fractureForce\":" << fractureForce << "}}";
        std::string res;
        return sendCommand(ss.str(), res);
    }

    bool createCircle(const std::string& id, float x, float y, float radius, 
                      bool isDynamic = true, bool isDestructible = false) {
        std::ostringstream ss;
        ss << "{\"method\":\"create_circle\",\"params\":{\"id\":\"" << id 
           << "\",\"x\":" << x << ",\"y\":" << y 
           << ",\"radius\":" << radius 
           << ",\"type\":\"" << (isDynamic ? "dynamic" : "static") 
           << "\",\"isDestructible\":" << (isDestructible ? "true" : "false") << "}}";
        std::string res;
        return sendCommand(ss.str(), res);
    }

    bool applyForce(const std::string& id, float fx, float fy) {
        std::ostringstream ss;
        ss << "{\"method\":\"apply_force\",\"params\":{\"id\":\"" << id 
           << "\",\"fx\":" << fx << ",\"fy\":" << fy << "}}";
        std::string res;
        return sendCommand(ss.str(), res);
    }

    bool applyImpulse(const std::string& id, float ix, float iy) {
        std::ostringstream ss;
        ss << "{\"method\":\"apply_impulse\",\"params\":{\"id\":\"" << id 
           << "\",\"ix\":" << ix << ",\"iy\":" << iy << "}}";
        std::string res;
        return sendCommand(ss.str(), res);
    }

    WorldSnapshot step(float dt = 1.0f / 60.0f) {
        std::ostringstream ss;
        ss << "{\"method\":\"step\",\"params\":{\"dt\":" << dt << "}}";
        std::string res;
        sendCommand(ss.str(), res);
        return parseSnapshot(res);
    }

    WorldSnapshot getState() {
        std::string res;
        sendCommand("{\"method\":\"get_state\"}", res);
        return parseSnapshot(res);
    }

private:
#ifdef SUBQG_PLATFORM_WINDOWS
    SOCKET m_socket = INVALID_SOCKET;
#else
    int m_socket = -1;
#endif
    bool m_connected = false;
    std::string m_readBuffer;

    bool sendCommand(const std::string& json, std::string& outResponse) {
        if (!m_connected) return false;

        std::string payload = json + "\n";
        int sent = ::send(m_socket, payload.c_str(), static_cast<int>(payload.length()), 0);
        if (sent <= 0) return false;

        // Warte auf Newline in der Antwort
        char buf[4096];
        while (m_readBuffer.find('\n') == std::string::npos) {
            int received = ::recv(m_socket, buf, sizeof(buf) - 1, 0);
            if (received <= 0) return false;
            buf[received] = '\0';
            m_readBuffer += buf;
        }

        size_t newlinePos = m_readBuffer.find('\n');
        outResponse = m_readBuffer.substr(0, newlinePos);
        m_readBuffer.erase(0, newlinePos + 1);
        return true;
    }

    // Schlanker Parser für Snapshot-Daten ohne externe JSON-Bibliothek
    WorldSnapshot parseSnapshot(const std::string& json) {
        WorldSnapshot snap;
        // Suche nach "bodies":[{...}]
        size_t bodiesPos = json.find("\"bodies\":[");
        if (bodiesPos == std::string::npos) return snap;

        size_t cur = bodiesPos + 10;
        while (cur < json.length()) {
            size_t objStart = json.find('{', cur);
            size_t objEnd = json.find('}', objStart);
            if (objStart == std::string::npos || objEnd == std::string::npos) break;

            std::string bodyJson = json.substr(objStart, objEnd - objStart + 1);
            BodyState b;
            b.id = extractStringField(bodyJson, "id");
            b.type = extractStringField(bodyJson, "type");
            b.x = extractFloatField(bodyJson, "x");
            b.y = extractFloatField(bodyJson, "y");
            b.angle = extractFloatField(bodyJson, "angle");
            b.angleDeg = extractFloatField(bodyJson, "angleDeg");
            b.vx = extractFloatField(bodyJson, "vx");
            b.vy = extractFloatField(bodyJson, "vy");
            b.w = extractFloatField(bodyJson, "w");

            snap.bodies.push_back(b);
            cur = objEnd + 1;
            if (json[cur] == ']') break;
        }

        snap.bodyCount = static_cast<int>(snap.bodies.size());
        return snap;
    }

    std::string extractStringField(const std::string& obj, const std::string& key) {
        std::string pattern = "\"" + key + "\":\"";
        size_t p = obj.find(pattern);
        if (p == std::string::npos) return "";
        size_t start = p + pattern.length();
        size_t end = obj.find('"', start);
        return obj.substr(start, end - start);
    }

    float extractFloatField(const std::string& obj, const std::string& key) {
        std::string pattern = "\"" + key + "\":";
        size_t p = obj.find(pattern);
        if (p == std::string::npos) return 0.0f;
        size_t start = p + pattern.length();
        size_t end = obj.find_first_of(",}", start);
        try {
            return std::stof(obj.substr(start, end - start));
        } catch (...) {
            return 0.0f;
        }
    }
};

} // namespace SubQG
