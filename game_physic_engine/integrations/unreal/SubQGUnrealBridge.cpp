#include "SubQGUnrealBridge.h"
#include "Common/TcpSocketBuilder.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Dom/JsonObject.h"

void USubQGPhysicsSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
	Super::Initialize(Collection);
	ClientSocket = nullptr;
	NextRequestId = 1;
}

void USubQGPhysicsSubsystem::Deinitialize()
{
	Disconnect();
	Super::Deinitialize();
}

bool USubQGPhysicsSubsystem::ConnectToSubQGServer(FString Host, int32 Port)
{
	Disconnect();

	FIPv4Address IPAddress;
	if (!FIPv4Address::Parse(Host, IPAddress))
	{
		UE_LOG(LogTemp, Error, TEXT("[SubQG UE5] Ungültige IP: %s"), *Host);
		return false;
	}

	TSharedRef<FInternetAddr> Addr = ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->CreateInternetAddr();
	Addr->SetIp(IPAddress.Value);
	Addr->SetPort(Port);

	ClientSocket = FTcpSocketBuilder(TEXT("SubQG_UE_Client"))
		.AsReusable()
		.AsBlocking()
		.Build();

	if (!ClientSocket || !ClientSocket->Connect(*Addr))
	{
		UE_LOG(LogTemp, Error, TEXT("[SubQG UE5] Verbindung zu %s:%d fehlgeschlagen!"), *Host, Port);
		Disconnect();
		return false;
	}

	ClientSocket->SetNonBlocking(true);
	UE_LOG(LogTemp, Log, TEXT("[SubQG UE5] Erfolgreich mit SubQG Physics Server verbunden (%s:%d)!"), *Host, Port);

	// Welt initialisieren
	FString InitResponse;
	SendJsonCommand(TEXT("{\"method\":\"create_world\",\"params\":{\"engineMode\":\"pure-subqg\",\"gravity\":[0,-9.81]}}"), InitResponse);

	return true;
}

void USubQGPhysicsSubsystem::Disconnect()
{
	if (ClientSocket)
	{
		ClientSocket->Close();
		ISocketSubsystem::Get(PLATFORM_SOCKETSUBSYSTEM)->DestroySocket(ClientSocket);
		ClientSocket = nullptr;
	}
	ActorBindings.Empty();
	ReceiveBuffer.Empty();
}

void USubQGPhysicsSubsystem::RegisterActorBinding(const FString& BodyId, AActor* TargetActor)
{
	if (TargetActor)
	{
		ActorBindings.Add(BodyId, TargetActor);
	}
}

void USubQGPhysicsSubsystem::SpawnSubQGBox(const FString& BodyId, FVector WorldLocation, FVector SizeCm, bool bIsDynamic, bool bIsDestructible, float FractureForce)
{
	const float X_m = WorldLocation.X / 100.0f;
	const float Y_m = WorldLocation.Z / 100.0f; // Unreal Z ist SubQG Y (Höhe)
	const float Width_m = SizeCm.X / 100.0f;
	const float Height_m = SizeCm.Z / 100.0f;

	FString Cmd = FString::Printf(
		TEXT("{\"method\":\"create_box\",\"params\":{\"id\":\"%s\",\"x\":%f,\"y\":%f,\"width\":%f,\"height\":%f,\"type\":\"%s\",\"isDestructible\":%s,\"fractureForce\":%f}}"),
		*BodyId, X_m, Y_m, Width_m, Height_m,
		bIsDynamic ? TEXT("dynamic") : TEXT("static"),
		bIsDestructible ? TEXT("true") : TEXT("false"),
		FractureForce
	);

	FString Dummy;
	SendJsonCommand(Cmd, Dummy);
}

void USubQGPhysicsSubsystem::SpawnSubQGSphere(const FString& BodyId, FVector WorldLocation, float RadiusCm, bool bIsDynamic, bool bIsDestructible)
{
	const float X_m = WorldLocation.X / 100.0f;
	const float Y_m = WorldLocation.Z / 100.0f;
	const float Radius_m = RadiusCm / 100.0f;

	FString Cmd = FString::Printf(
		TEXT("{\"method\":\"create_circle\",\"params\":{\"id\":\"%s\",\"x\":%f,\"y\":%f,\"radius\":%f,\"type\":\"%s\",\"isDestructible\":%s}}"),
		*BodyId, X_m, Y_m, Radius_m,
		bIsDynamic ? TEXT("dynamic") : TEXT("static"),
		bIsDestructible ? TEXT("true") : TEXT("false")
	);

	FString Dummy;
	SendJsonCommand(Cmd, Dummy);
}

void USubQGPhysicsSubsystem::ApplySubQGForce(const FString& BodyId, FVector ForceNewtons)
{
	FString Cmd = FString::Printf(
		TEXT("{\"method\":\"apply_force\",\"params\":{\"id\":\"%s\",\"fx\":%f,\"fy\":%f}}"),
		*BodyId, ForceNewtons.X, ForceNewtons.Z
	);
	FString Dummy;
	SendJsonCommand(Cmd, Dummy);
}

void USubQGPhysicsSubsystem::ApplySubQGImpulse(const FString& BodyId, FVector ImpulseNs)
{
	FString Cmd = FString::Printf(
		TEXT("{\"method\":\"apply_impulse\",\"params\":{\"id\":\"%s\",\"ix\":%f,\"iy\":%f}}"),
		*BodyId, ImpulseNs.X, ImpulseNs.Z
	);
	FString Dummy;
	SendJsonCommand(Cmd, Dummy);
}

void USubQGPhysicsSubsystem::Tick(float DeltaTime)
{
	if (!ClientSocket) return;

	// 1. Sende Schritt-Befehl an die SubQG Engine
	const float FixedDt = FMath::Clamp(DeltaTime, 0.001f, 0.05f);
	FString StepCmd = FString::Printf(TEXT("{\"method\":\"step\",\"params\":{\"dt\":%f}}"), FixedDt);
	
	FString Response;
	if (SendJsonCommand(StepCmd, Response))
	{
		DispatchSubQGState(Response);
	}
}

bool USubQGPhysicsSubsystem::SendJsonCommand(const FString& JsonCommand, FString& OutResponse)
{
	if (!ClientSocket) return false;

	FString Payload = JsonCommand + TEXT("\n");
	FTCHARToUTF8 Utf8Payload(*Payload);

	int32 BytesSent = 0;
	if (!ClientSocket->Send((const uint8*)Utf8Payload.Get(), Utf8Payload.Length(), BytesSent))
	{
		return false;
	}

	// Lese Antwort
	TArray<uint8> ReadBuffer;
	ReadBuffer.SetNumUninitialized(8192);

	int32 BytesRead = 0;
	if (ClientSocket->Recv(ReadBuffer.GetData(), ReadBuffer.Num(), BytesRead))
	{
		if (BytesRead > 0)
		{
			FString Chunk = FUTF8ToTCHAR((const ANSICHAR*)ReadBuffer.GetData(), BytesRead);
			ReceiveBuffer += Chunk;

			int32 NewlineIndex;
			if (ReceiveBuffer.FindChar(TEXT('\n'), NewlineIndex))
			{
				OutResponse = ReceiveBuffer.Left(NewlineIndex);
				ReceiveBuffer = ReceiveBuffer.Mid(NewlineIndex + 1);
				return true;
			}
		}
	}

	return false;
}

void USubQGPhysicsSubsystem::DispatchSubQGState(const FString& JsonResponse)
{
	TSharedPtr<FJsonObject> RootObject;
	TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonResponse);

	if (!FJsonSerializer::Deserialize(Reader, RootObject) || !RootObject.IsValid())
	{
		return;
	}

	const TSharedPtr<FJsonObject>* ResultObject;
	if (!RootObject->TryGetObjectField(TEXT("result"), ResultObject))
	{
		return;
	}

	// 1. Aktualisiere gebundene Actors
	const TArray<TSharedPtr<FJsonValue>>* BodiesArray;
	if ((*ResultObject)->TryGetArrayField(TEXT("bodies"), BodiesArray))
	{
		for (const auto& BodyVal : *BodiesArray)
		{
			TSharedPtr<FJsonObject> B = BodyVal->AsObject();
			if (!B.IsValid()) continue;

			FString Id = B->GetStringField(TEXT("id"));
			float X = (float)B->GetNumberField(TEXT("x"));
			float Y = (float)B->GetNumberField(TEXT("y"));
			float Angle = (float)B->GetNumberField(TEXT("angle"));

			if (TWeakObjectPtr<AActor>* TargetPtr = ActorBindings.Find(Id))
			{
				if (AActor* Target = TargetPtr->Get())
				{
					FVector NewLoc = SubQGToUnrealLocation(X, Y, Target->GetActorLocation().Y);
					FRotator NewRot = SubQGToUnrealRotation(Angle);
					Target->SetActorLocationAndRotation(NewLoc, NewRot);
				}
			}
		}
	}

	// 2. Verarbeite Materialbruch & Gelenkbrüche
	const TArray<TSharedPtr<FJsonValue>>* EventsArray;
	if ((*ResultObject)->TryGetArrayField(TEXT("events"), EventsArray))
	{
		for (const auto& EventVal : *EventsArray)
		{
			TSharedPtr<FJsonObject> Evt = EventVal->AsObject();
			if (!Evt.IsValid()) continue;

			FString EvtType = Evt->GetStringField(TEXT("type"));
			if (EvtType == TEXT("body_shatter"))
			{
				FString ShatterBodyId = Evt->GetStringField(TEXT("bodyId"));
				float Force = (float)Evt->GetNumberField(TEXT("impactForce"));
				const TArray<TSharedPtr<FJsonValue>>* PtArr;
				FVector ImpactLoc = FVector::ZeroVector;
				if (Evt->TryGetArrayField(TEXT("point"), PtArr) && PtArr->Num() >= 2)
				{
					ImpactLoc = SubQGToUnrealLocation((*PtArr)[0]->AsNumber(), (*PtArr)[1]->AsNumber());
				}
				OnSubQGFracture.Broadcast(ShatterBodyId, ImpactLoc, Force);
			}
			else if (EvtType == TEXT("joint_break"))
			{
				int32 JointId = Evt->GetIntegerField(TEXT("jointId"));
				OnSubQGJointBreak.Broadcast(JointId);
			}
		}
	}
}
