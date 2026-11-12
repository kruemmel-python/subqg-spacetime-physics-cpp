#include <subqg/physics.hpp>
#include <iostream>
int main(){
    subqg::World world({0,-9.81},subqg::PhysicsMode::PureSubQG);
    world.createBox(0,0,20,1,subqg::BodyType::Static,subqg::Material::wood());
    auto& box=world.createBox(0,5,1,1,subqg::BodyType::Dynamic,subqg::Material::wood());
    for(int frame=0;frame<240;++frame)world.step(1.0/60.0);
    std::cout<<"Box y="<<box.position.y<<", SubQG edges="<<world.diagnostics.edgeCount<<"\n";
}
