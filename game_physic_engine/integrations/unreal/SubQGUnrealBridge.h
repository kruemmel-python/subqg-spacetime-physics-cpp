#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"
#include "Sockets.h"
#include "SocketSubsystem.h"
#include "SubQGUnrealBridge.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnSubQGFractureSignature, const FString&, BodyId, const FVector&, Location, float, ReactionForce);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnSubQGJointBreakSignature, int32, JointId);

USTRUCT(BlueprintType)
struct FSubQGBodyState
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "SubQG")
	FString Id;

	UPROPERTY(BlueprintReadOnly, Category = "SubQG")
	FVector WorldPosition = FVector::ZeroVector;

	UPROPERTY(BlueprintReadOnly, Category = "SubQG")
	FRotator WorldRotation = FRotator::ZeroRotator;

	UPROPERTY(BlueprintReadOnly, Category = "SubQG")
	FVector LinearVelocity = FVector::ZeroVector;

	UPROPERTY(BlueprintReadOnly, Category = "SubQG")
	bool bIsSleeping = false;
};

/**
 * USubQGPhysicsSubsystem: Unreal Engine 5 Subsystem für die SubQG Physics Engine.
 * 
 * Synchronisiert Unreal Engine Actors/Components mit dem SubQG Relationalen Metrikgitter
 * über einen performanten TCP Socket Stream bei 60/120 Hz.
 */
UCLASS()
class SUBQGUNREALBRIDGE_API USubQGPhysicsSubsystem : public UTickableWorldSubsystem
{
	GENERATED_BODY()

public:
	virtual void Initialize(FSubsystemCollectionBase& Collection) override;
	virtual void Deinitialize() override;
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override { RETURN_QUICK_DECLARE_CYCLE_STAT(USubQGPhysicsSubsystem, STATGROUP_Tickables); }

	// ==========================================
	// BLUEPRINT API
	// ==========================================

	/** Verbindet mit dem SubQG Physics Server */
	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	bool ConnectToSubQGServer(FString Host = TEXT("127.0.0.1"), int32 Port = 3001);

	/** Trennt die Verbindung */
	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void Disconnect();

	/** Registriert einen Unreal Actor zur Echtzeit-Synchronisation mit SubQG */
	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void RegisterActorBinding(const FString& BodyId, AActor* TargetActor);

	/** Erzeugt eine Box in der SubQG Engine */
	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void SpawnSubQGBox(const FString& BodyId, FVector WorldLocation, FVector SizeCm, bool bIsDynamic = true, bool bIsDestructible = false, float FractureForce = 350.0f);

	/** Erzeugt eine Kugel/Kreis in der SubQG Engine */
	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void SpawnSubQGSphere(const FString& BodyId, FVector WorldLocation, float RadiusCm, bool bIsDynamic = true, bool bIsDestructible = false);

	/** Übt eine kontinuierliche Kraft auf einen SubQG Körper aus */
	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void ApplySubQGForce(const FString& BodyId, FVector ForceNewtons);

	/** Übt einen Sofort-Impuls auf einen SubQG Körper aus */
	UFUNCTION(BlueprintCallable, Category = "SubQG Physics")
	void ApplySubQGImpulse(const FString& BodyId, FVector ImpulseNs);

	// ==========================================
	// EVENTS & DELEGATES
	// ==========================================

	/** Gefeuert, wenn ein Körper durch Stoß überlastet und zertrümmert wird (Niagara/Chaos Effekt) */
	UPROPERTY(BlueprintAssignable, Category = "SubQG Physics|Events")
	FOnSubQGFractureSignature OnSubQGFracture;

	/** Gefeuert, wenn eine Gelenkverbindung reißt */
	UPROPERTY(BlueprintAssignable, Category = "SubQG Physics|Events")
	FOnSubQGJointBreakSignature OnSubQGJointBreak;

private:
	FSocket* ClientSocket = nullptr;
	int32 NextRequestId = 1;
	TMap<FString, TWeakObjectPtr<AActor>> ActorBindings;
	FString ReceiveBuffer;

	bool SendJsonCommand(const FString& JsonCommand, FString& OutResponse);
	void ProcessIncomingData(const FString& Data);
	void DispatchSubQGState(const FString& JsonResponse);

	// Koordinatentransformation: SubQG (Meter, 2D) <-> Unreal Engine (Zentimeter, 3D Z-Up)
	static FVector SubQGToUnrealLocation(float X_m, float Y_m, float Z_PlaneCm = 0.0f)
	{
		return FVector(X_m * 100.0f, Z_PlaneCm, Y_m * 100.0f);
	}

	static FRotator SubQGToUnrealRotation(float AngleRad)
	{
		// 2D Rotation um die Y-Achse in Unreal (Pitch)
		return FRotator(FMath::RadiansToDegrees(-AngleRad), 0.0f, 0.0f);
	}
};
