#pragma once

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <functional>
#include <limits>
#include <memory>
#include <optional>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>

#if defined(_WIN32) && defined(SUBQG_SHARED)
#  if defined(SUBQG_BUILDING)
#    define SUBQG_API __declspec(dllexport)
#  else
#    define SUBQG_API __declspec(dllimport)
#  endif
#else
#  define SUBQG_API
#endif

namespace subqg {

constexpr double epsilon = 1e-9;
constexpr double pi = 3.14159265358979323846;

struct SUBQG_API Vec2 {
    double x = 0.0, y = 0.0;
    constexpr Vec2() = default;
    constexpr Vec2(double x_, double y_) : x(x_), y(y_) {}
    Vec2 operator+(const Vec2& v) const { return {x + v.x, y + v.y}; }
    Vec2 operator-(const Vec2& v) const { return {x - v.x, y - v.y}; }
    Vec2 operator-() const { return {-x, -y}; }
    Vec2 operator*(double s) const { return {x * s, y * s}; }
    Vec2 operator/(double s) const { return std::abs(s) > epsilon ? Vec2{x / s, y / s} : Vec2{}; }
    Vec2& operator+=(const Vec2& v) { x += v.x; y += v.y; return *this; }
    Vec2& operator-=(const Vec2& v) { x -= v.x; y -= v.y; return *this; }
    Vec2& operator*=(double s) { x *= s; y *= s; return *this; }
    double dot(const Vec2& v) const { return x * v.x + y * v.y; }
    double cross(const Vec2& v) const { return x * v.y - y * v.x; }
    double lengthSquared() const { return dot(*this); }
    double length() const { return std::sqrt(lengthSquared()); }
    Vec2 normalized() const { const double l = length(); return l > epsilon ? *this / l : Vec2{}; }
    Vec2 perpendicular() const { return {-y, x}; }
    Vec2 rotated(double a) const { const double c=std::cos(a), s=std::sin(a); return {c*x-s*y,s*x+c*y}; }
};
inline Vec2 operator*(double s, const Vec2& v) { return v * s; }
inline Vec2 cross(double s, const Vec2& v) { return {-s * v.y, s * v.x}; }
inline Vec2 cross(const Vec2& v, double s) { return {s * v.y, -s * v.x}; }

struct SUBQG_API Mat22 {
    double a=1,b=0,c=0,d=1;
    Mat22() = default;
    Mat22(double a_, double b_, double c_, double d_) : a(a_),b(b_),c(c_),d(d_) {}
    Vec2 operator*(const Vec2& v) const { return {a*v.x+b*v.y,c*v.x+d*v.y}; }
    Mat22 inverse() const;
};

struct SUBQG_API Transform {
    Vec2 position{};
    double angle=0;
    Vec2 apply(const Vec2& p) const { return position + p.rotated(angle); }
    Vec2 inverseApply(const Vec2& p) const { return (p-position).rotated(-angle); }
};

struct SUBQG_API AABB {
    Vec2 min{}, max{};
    bool overlaps(const AABB& o) const;
    bool contains(const Vec2& p) const;
    AABB expanded(double margin) const;
    static AABB combine(const AABB& a, const AABB& b);
};

struct SUBQG_API Material {
    double density=1.0, friction=0.5, restitution=0.1;
    static Material wood(); static Material metal(); static Material rubber();
    static Material stone(); static Material ice(); static Material bouncy();
};

enum class BodyType { Static, Kinematic, Dynamic };
enum class ShapeType { Circle, Box, Polygon, Capsule, Segment };

struct SUBQG_API MassData { double mass=0, inertia=0; Vec2 center{}; };

class SUBQG_API Shape {
public:
    explicit Shape(ShapeType t) : type(t) {}
    virtual ~Shape() = default;
    ShapeType type;
    Material material{};
    bool isTrigger=false;
    Vec2 localPosition{};
    double localAngle=0;
    virtual MassData massData() const = 0;
    virtual AABB aabb(const Transform& bodyTransform) const = 0;
    virtual std::vector<Vec2> worldVertices(const Transform& bodyTransform) const;
};

class SUBQG_API Circle final : public Shape {
public:
    explicit Circle(double radius);
    double radius;
    MassData massData() const override;
    AABB aabb(const Transform&) const override;
};
class SUBQG_API Box final : public Shape {
public:
    Box(double width, double height);
    double width, height;
    MassData massData() const override;
    AABB aabb(const Transform&) const override;
    std::vector<Vec2> worldVertices(const Transform&) const override;
};
class SUBQG_API Polygon final : public Shape {
public:
    explicit Polygon(std::vector<Vec2> vertices);
    std::vector<Vec2> vertices;
    MassData massData() const override;
    AABB aabb(const Transform&) const override;
    std::vector<Vec2> worldVertices(const Transform&) const override;
};
class SUBQG_API Capsule final : public Shape {
public:
    Capsule(double radius, double height);
    double radius, height;
    MassData massData() const override;
    AABB aabb(const Transform&) const override;
};
class SUBQG_API Segment final : public Shape {
public:
    Segment(Vec2 a, Vec2 b, double thickness=0.02);
    Vec2 a,b; double thickness;
    MassData massData() const override;
    AABB aabb(const Transform&) const override;
};

class Joint;
class World;

class SUBQG_API Body {
public:
    explicit Body(BodyType type=BodyType::Dynamic);
    std::uint64_t id=0;
    BodyType type;
    Vec2 position{}, velocity{}, force{};
    double angle=0, angularVelocity=0, torque=0;
    double mass=1, invMass=1, inertia=1, invInertia=1;
    double linearDamping=0.01, angularDamping=0.01, gravityScale=1;
    bool allowSleep=true, sleeping=false, fixedRotation=false;
    double sleepTime=0;
    std::vector<std::unique_ptr<Shape>> shapes;
    std::vector<Joint*> joints;
    Shape& addShape(std::unique_ptr<Shape> shape);
    void recomputeMass();
    void applyForce(Vec2 f); void applyForceAtPoint(Vec2 f, Vec2 worldPoint);
    void applyTorque(double t); void applyImpulse(Vec2 p); void applyImpulseAtPoint(Vec2 p, Vec2 worldPoint);
    void applyAngularImpulse(double p); Vec2 velocityAtPoint(Vec2 worldPoint) const;
    Transform transform() const { return {position,angle}; }
    void wake(); void putToSleep();
};

struct SUBQG_API ContactPoint { Vec2 point{}; double penetration=0, normalImpulse=0, tangentImpulse=0; };
struct SUBQG_API ContactManifold {
    Body* bodyA=nullptr; Body* bodyB=nullptr; Shape* shapeA=nullptr; Shape* shapeB=nullptr;
    Vec2 normal{}, tangent{}; std::vector<ContactPoint> points;
    double friction=0.5, restitution=0.1; bool isTrigger=false;
};

class SUBQG_API CollisionNarrowphase {
public:
    static std::optional<ContactManifold> collide(Body&, Shape&, Body&, Shape&);
};

// API-kompatible Broadphase-Fassade. Die Implementierung verwaltet Fat-AABBs
// deterministisch und kann später ohne API-Bruch durch einen BVH ersetzt werden.
class SUBQG_API DynamicAABBTree {
public:
    int insert(AABB box, void* userData); void remove(int proxyId); void update(int proxyId,AABB box);
    std::vector<void*> query(AABB box) const; std::size_t size() const { return entries_.size(); }
private:
    struct Entry { int id; AABB box; void* data; }; int nextId_=1; std::vector<Entry> entries_;
};

class SUBQG_API SAT {
public:
    static bool overlap(const std::vector<Vec2>& a,const std::vector<Vec2>& b,Vec2* normal=nullptr,double* depth=nullptr);
};

struct SUBQG_API RaycastHit { Body* body=nullptr; Shape* shape=nullptr; Vec2 point{},normal{}; double distance=0,fraction=0; };

enum class JointType { Distance, Revolute, Prismatic, Weld, Pulley };
class SUBQG_API Joint {
public:
    Joint(JointType type, Body& a, Body& b); virtual ~Joint()=default;
    JointType type; Body& bodyA; Body& bodyB;
    virtual void solveVelocity(double dt)=0; virtual void solvePosition(double dt)=0;
};
class SUBQG_API DistanceJoint final : public Joint {
public:
    DistanceJoint(Body&,Body&,Vec2 worldA,Vec2 worldB,double length=-1);
    Vec2 localAnchorA{},localAnchorB{}; double length=0,frequencyHz=0,dampingRatio=0;
    void solveVelocity(double) override; void solvePosition(double) override;
};
class SUBQG_API RevoluteJoint final : public Joint {
public:
    RevoluteJoint(Body&,Body&,Vec2 worldAnchor);
    Vec2 localAnchorA{},localAnchorB{}; double referenceAngle=0;
    bool enableMotor=false,enableLimit=false; double motorSpeed=0,maxMotorTorque=0,lowerAngle=0,upperAngle=0;
    void solveVelocity(double) override; void solvePosition(double) override;
};
class SUBQG_API PrismaticJoint final : public Joint {
public:
    PrismaticJoint(Body&,Body&,Vec2 worldAnchor,Vec2 worldAxis);
    Vec2 localAnchorA{},localAnchorB{},localAxisA{1,0}; double referenceAngle=0;
    bool enableMotor=false,enableLimit=false; double motorSpeed=0,maxMotorForce=0,lowerTranslation=0,upperTranslation=0;
    void solveVelocity(double) override; void solvePosition(double) override;
};
class SUBQG_API WeldJoint final : public Joint {
public:
    WeldJoint(Body&,Body&,Vec2 worldAnchor);
    Vec2 localAnchorA{},localAnchorB{}; double referenceAngle=0;
    void solveVelocity(double) override; void solvePosition(double) override;
};
class SUBQG_API PulleyJoint final : public Joint {
public:
    PulleyJoint(Body&,Body&,Vec2 groundA,Vec2 groundB,Vec2 anchorA,Vec2 anchorB,double ratio=1);
    Vec2 groundAnchorA{},groundAnchorB{},localAnchorA{},localAnchorB{}; double ratio=1,constant=0;
    void solveVelocity(double) override; void solvePosition(double) override;
};

struct SUBQG_API RelationalNode { int gx=0,gy=0; Vec2 position{}; double rho=0,phi=0; };
struct SUBQG_API RelationalEdge { std::string u,v; double x_e=1,weight=1; };
class SUBQG_API RelationalGraph {
public:
    RelationalGraph(double cellSize=1,int extent=12,double beta=0.015);
    double cellSize,beta; int extent;
    std::unordered_map<std::string,RelationalNode> nodes; std::vector<RelationalEdge> edges;
    void rebuild(Vec2 center={}); void depositMass(const std::vector<std::unique_ptr<Body>>& bodies);
    Vec2 sampleGradient(Vec2 p) const; std::string key(int gx,int gy) const;
};
struct SUBQG_API LatticeDiagnostics { double totalEdgeAction=0,maxStrain=0; std::size_t edgeCount=0,nodeCount=0; };
class SUBQG_API MetricLatticeSolver {
public:
    explicit MetricLatticeSolver(RelationalGraph&); RelationalGraph& graph;
    double kappa=4,mu=0.2; int iterations=8; LatticeDiagnostics solve();
};
class SUBQG_API SubQGGravitationField {
public:
    Vec2 gravity{0,-9.81}; bool enableMutualAttraction=false; double G=1;
    void applyGravity(std::vector<std::unique_ptr<Body>>&,RelationalGraph* graph=nullptr) const;
};
class SUBQG_API SubQGContactBridge {
public:
    double edgeStiffness=1e6,edgeDamping=1e3,baumgarteFactor=0.2,slop=0.005;
    Material combineMaterials(const Material&,const Material&) const; double penetrationBias(double,double) const;
};
class SUBQG_API SubQGPureDynamics {
public:
    explicit SubQGPureDynamics(RelationalGraph& graph):graph(graph){}
    RelationalGraph& graph; double kBarrier=3e4,dampBarrier=180,muSubQG=0.45,kJointLink=8e4,dampJoint=350;
    void evaluateGravitationalForces(std::vector<std::unique_ptr<Body>>&,Vec2 backgroundGravity) const;
    void applyPureContactForces(std::vector<ContactManifold>&,double dt) const;
    void applyPureJointForces(std::vector<std::unique_ptr<Joint>>&,double dt) const;
};

struct SUBQG_API StepConfig { int velocityIterations=8,positionIterations=3; bool enableSleeping=true; double timeToSleep=0.5; };
enum class PhysicsMode { Hybrid, PureSubQG };
struct SUBQG_API Diagnostics { double totalEdgeAction=0,maxMetricStrain=0,stepTimeMs=0; std::size_t nodeCount=0,edgeCount=0,activeContacts=0; std::uint64_t contactSolverCalls=0; };

class SUBQG_API ContactListener {
public:
    virtual ~ContactListener()=default;
    virtual void onTriggerEnter(Shape&,Shape&,Body&,Body&){} virtual void onTriggerStay(Shape&,Shape&,Body&,Body&){}
    virtual void onTriggerExit(Shape&,Shape&,Body&,Body&){} virtual void onContact(const ContactManifold&){}
};

class SUBQG_API World {
public:
    explicit World(Vec2 gravity={0,-9.81},PhysicsMode mode=PhysicsMode::Hybrid);
    Vec2 gravity; PhysicsMode mode; StepConfig stepConfig{}; Diagnostics diagnostics{};
    std::vector<std::unique_ptr<Body>> bodies; std::vector<std::unique_ptr<Joint>> joints;
    RelationalGraph relationalGraph; MetricLatticeSolver metricSolver; SubQGGravitationField gravitation;
    SubQGContactBridge contactBridge; SubQGPureDynamics pureDynamics;
    Body& createBody(BodyType type,Vec2 position={},double angle=0);
    Body& createBox(double x,double y,double width,double height,BodyType type=BodyType::Dynamic,Material material=Material{});
    Body& createCircle(double x,double y,double radius,BodyType type=BodyType::Dynamic,Material material=Material{});
    Body& createPolygon(double x,double y,std::vector<Vec2> vertices,BodyType type=BodyType::Dynamic,Material material=Material{});
    Body& createCapsule(double x,double y,double radius,double height,BodyType type=BodyType::Dynamic,Material material=Material{});
    Body& createSegment(Vec2 a,Vec2 b,BodyType type=BodyType::Static,Material material=Material{});
    DistanceJoint& createDistanceJoint(Body&,Body&,Vec2,Vec2,double length=-1);
    RevoluteJoint& createRevoluteJoint(Body&,Body&,Vec2);
    PrismaticJoint& createPrismaticJoint(Body&,Body&,Vec2,Vec2);
    WeldJoint& createWeldJoint(Body&,Body&,Vec2);
    PulleyJoint& createPulleyJoint(Body&,Body&,Vec2,Vec2,Vec2,Vec2,double ratio=1);
    void destroyBody(Body&); void destroyJoint(Joint&); void addContactListener(ContactListener*);
    void step(double dt); std::optional<RaycastHit> raycast(Vec2 origin,Vec2 direction,double maxDistance) const;
    std::vector<RaycastHit> raycastAll(Vec2 origin,Vec2 direction,double maxDistance) const;
    const std::vector<ContactManifold>& contacts() const { return manifolds_; }
private:
    std::uint64_t nextBodyId_=1; std::vector<ContactManifold> manifolds_; std::vector<ContactListener*> listeners_;
    std::unordered_set<std::string> triggerPairs_;
    std::unordered_map<std::string,std::tuple<Shape*,Shape*,Body*,Body*>> triggerRecords_;
    void detectCollisions(); void solveHybrid(double dt); void updateTriggers();
};

struct SUBQG_API DestructionConfig { double fractureThreshold=25,minFragmentArea=0.01; int maxFragments=16; };
class SUBQG_API SubQGDestructionSystem {
public:
    explicit SubQGDestructionSystem(World& world,DestructionConfig cfg={}):world(world),config(cfg){}
    World& world; DestructionConfig config;
    bool shouldFracture(const Body&,double impulse) const; std::vector<Body*> fracture(Body&,Vec2 impactPoint,double impulse);
};

SUBQG_API const char* version();
}
