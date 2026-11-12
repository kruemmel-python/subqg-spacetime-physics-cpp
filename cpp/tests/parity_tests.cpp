#include "subqg/physics.hpp"
#include <cmath>
#include <iostream>
#include <stdexcept>
using namespace subqg;
static void require(bool value,const char* message){if(!value)throw std::runtime_error(message);}
struct Listener final:ContactListener{int enter=0,stay=0,exit=0;void onTriggerEnter(Shape&,Shape&,Body&,Body&)override{++enter;}void onTriggerStay(Shape&,Shape&,Body&,Body&)override{++stay;}void onTriggerExit(Shape&,Shape&,Body&,Body&)override{++exit;}};
int main(){
 try {
  require(std::abs(Vec2{3,4}.length()-5)<1e-12,"Vec2 algebra");
  { Body ga(BodyType::Static), gb(BodyType::Dynamic); ga.position={0,0}; gb.position={0,.4}; Box sa(20,1),sb(1,1); auto m=CollisionNarrowphase::collide(ga,sa,gb,sb); require((bool)m&&m->normal.y>.9,"direct contact"); }
  for(auto mode:{PhysicsMode::Hybrid,PhysicsMode::PureSubQG}){
   World w({0,-9.81},mode);w.stepConfig.enableSleeping=false;w.createBox(0,0,20,1,BodyType::Static,Material::wood());auto& box=w.createBox(0,5,1,1,BodyType::Dynamic,Material::wood());
   for(int i=0;i<600;++i)w.step(1.0/120.0);
   require(std::isfinite(box.position.y),"finite fall result");require(box.position.y>0.35&&box.position.y<1.2,"box rests on ground");
   if(mode==PhysicsMode::PureSubQG)require(w.diagnostics.contactSolverCalls==0,"pure mode disables impulse solver");
  }
  World rays({0,0});auto& wall=rays.createBox(5,0,1,4,BodyType::Static);auto hit=rays.raycast({0,0},{1,0},20);require(hit&&hit->body==&wall,"raycast body");require(std::abs(hit->distance-4.5)<1e-6,"raycast distance");
  World triggers({0,0});Listener listener;triggers.addContactListener(&listener);auto& gate=triggers.createBox(0,0,2,2,BodyType::Static);gate.shapes[0]->isTrigger=true;auto& mover=triggers.createCircle(-3,0,.25);mover.velocity={2,0};for(int i=0;i<240;++i)triggers.step(1.0/60);require(listener.enter==1&&listener.stay>0&&listener.exit==1,"trigger enter/stay/exit");
  World metric({0,0});metric.createCircle(0,0,1,BodyType::Dynamic,Material::stone());metric.step(1.0/60);require(metric.diagnostics.nodeCount>0&&metric.diagnostics.edgeCount>0,"SubQG lattice exists");require(metric.diagnostics.maxMetricStrain>0,"mass deforms metric");
  World joints({0,0});auto&a=joints.createCircle(0,0,.2,BodyType::Static);auto&b=joints.createCircle(2,0,.2);joints.createDistanceJoint(a,b,{0,0},{2,0},2);b.applyImpulse({0,5});for(int i=0;i<120;++i)joints.step(1.0/120);require(std::abs((b.position-a.position).length()-2)<.25,"distance joint");
  std::cout<<"SubQG native parity tests passed (version "<<version()<<")\n";return 0;
 } catch(const std::exception&e){std::cerr<<"FAILED: "<<e.what()<<"\n";return 1;}
}
