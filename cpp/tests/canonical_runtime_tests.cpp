#include "subqg/canonical_runtime.hpp"
#include <cstdlib>
#include <iostream>
#include <stdexcept>
#include <string>
using namespace subqg;
static void require(bool v,const char*m){if(!v)throw std::runtime_error(m);}
int main(){
 try{
  const char* root=std::getenv("SUBQG_CANONICAL_DEVELOPER_ROOT");
  const char* bridge=std::getenv("SUBQG_CANONICAL_BRIDGE");
  const char* node=std::getenv("SUBQG_NODE_EXECUTABLE");
  require(root&&bridge,"canonical runtime test environment missing");
  CanonicalRuntime runtime({node?node:"node.exe",root,bridge});
  require(runtime.running(),"canonical runtime process");
  std::string modules=runtime.inventory();
  for(const char* required:{"subqg_action","subqg_causal","subqg_waves","subqg_genesis","subqg_multiverse_phases","subqg_graph_coupled_gravity","subqg_apple_experiment","subqg_unified_proof_engine","subqg_weak_field_metric","subqg_spin2_ir","subqg_solar_system","subqg_local_gravity","subqg_binary_pulsar","subqg_gw_observations","subqg_simplex_tensor_bridge","subqg_simplex_gauge_bridge","subqg_collective_spin2_hessian","subqg_simplex_parallel_transport"})
   require(modules.find(required)!=std::string::npos,"canonical module missing from inventory");
  require(runtime.invoke("subqg_fpv","overlap","[0,0]")=="1","canonical overlap result");
  std::string bonds=runtime.invoke("subqg_fpv","buildBonds","[[0,0],0.7]");
  require(bonds.find("\"w\":1")!=std::string::npos,"canonical bond construction");
  require(runtime.invoke("subqg_weak_field_metric","lensingStrengthRelativeToGammaOne","[1]")=="1","canonical weak-field lensing closure");
  std::string closure=runtime.invoke("subqg_weak_field_metric","singleMetricNoSlipClosure");
  require(closure.find("\"status\":\"conditional\"")!=std::string::npos,"canonical closure must expose derivation status");
  std::string spin2=runtime.invoke("subqg_spin2_ir","spinTwoInfraredAudit");
  require(spin2.find("\"independentPhysicalPolarizations\":2")!=std::string::npos,"canonical spin-two polarizations");
  require(spin2.find("\"infraredClosureSelfConsistent\":true")!=std::string::npos,"canonical spin-two infrared closure");
  require(runtime.invoke("subqg_solar_system","dualStrainHighAccelerationLimit","[2]")=="1","canonical solar-system high-field limit");
  require(runtime.invoke("subqg_local_gravity","eotvosParameter","[1,1]")=="0","canonical local-gravity Eotvos ratio");
  std::string binary=runtime.invoke("subqg_binary_pulsar","binaryRadiationClosureAudit");
  require(binary.find("\"leadingQuadrupoleFormulaAvailable\":true")!=std::string::npos,"canonical binary-radiation closure");
  require(binary.find("\"universalSourceNormalizationFromCanonicalMicroaction\":false")!=std::string::npos,"canonical binary-radiation bridge caveat");
  std::string directGw=runtime.invoke("subqg_gw_observations","directGravitationalWaveAudit");
  require(directGw.find("\"allDirectObservablesCompatible\":true")!=std::string::npos,"canonical direct gravitational-wave observations");
  require(directGw.find("\"fullMicroscopicDerivationClosed\":false")!=std::string::npos,"canonical direct gravitational-wave caveat");
  std::string collective=runtime.invoke("subqg_collective_spin2_hessian","canonicalCollectiveSpinTwoHessianAudit");
  require(collective.find("\"manifoldSupportedMasslessTTSector\":true")!=std::string::npos,"canonical collective spin-two Hessian");
  require(collective.find("\"selectionRuleHasExactIncrementalVariationalForm\":true")!=std::string::npos,"canonical causal selection variation");
  require(collective.find("\"selectionRuleDerivedFromOriginalContinuousMicroaction\":false")!=std::string::npos,"canonical selection microaction caveat");
  require(collective.find("\"fullCanonicalHessianMatchingClosed\":false")!=std::string::npos,"canonical collective-Hessian caveat");
  std::string transport=runtime.invoke("subqg_simplex_parallel_transport","canonicalSimplexParallelTransportAuditDefault");
  require(transport.find("\"localFrameTransportClosed\":true")!=std::string::npos,"canonical simplex frame transport");
  require(transport.find("\"closedLoopHolonomyIncludedInThisLocalAudit\":false")!=std::string::npos,"canonical holonomy audit separation");
  std::string holonomy=runtime.invoke("subqg_simplex_parallel_transport","canonicalDualHolonomyAuditDefault");
  require(holonomy.find("\"fundamentalLoopsTested\":84")!=std::string::npos,"canonical dual-loop basis");
  require(holonomy.find("\"holonomyConnectionMathematicallyClosed\":true")!=std::string::npos,"canonical holonomy closure");
  require(holonomy.find("\"einsteinReggeCurvatureMatchingDerived\":false")!=std::string::npos,"canonical curvature-matching caveat");
  auto proof=runtime.construct("subqg_unified_proof_engine","SubQGUnifiedProofEngine","[{\"G\":1,\"boxSize\":20}]");
  std::string a0=runtime.get(proof,"a0"); require(!a0.empty()&&a0!="null","proof-engine a0");
  std::string gravity=runtime.call(proof,"effectiveGravitationalAcceleration","[20,0.4]");
  require(gravity.find("\"localExponent\"")!=std::string::npos,"proof-engine gravity response");
  runtime.destroy(proof);runtime.stop();
  std::cout<<"Canonical FPV6 runtime tests passed\n";return 0;
 }catch(const std::exception&e){std::cerr<<"FAILED: "<<e.what()<<"\n";return 1;}
}
