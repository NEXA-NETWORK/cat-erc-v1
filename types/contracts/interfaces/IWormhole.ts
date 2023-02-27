/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export declare namespace WormholeStructs {
  export type GuardianSetStruct = {
    keys: PromiseOrValue<string>[];
    expirationTime: PromiseOrValue<BigNumberish>;
  };

  export type GuardianSetStructOutput = [string[], number] & {
    keys: string[];
    expirationTime: number;
  };

  export type SignatureStruct = {
    r: PromiseOrValue<BytesLike>;
    s: PromiseOrValue<BytesLike>;
    v: PromiseOrValue<BigNumberish>;
    guardianIndex: PromiseOrValue<BigNumberish>;
  };

  export type SignatureStructOutput = [string, string, number, number] & {
    r: string;
    s: string;
    v: number;
    guardianIndex: number;
  };

  export type VMStruct = {
    version: PromiseOrValue<BigNumberish>;
    timestamp: PromiseOrValue<BigNumberish>;
    nonce: PromiseOrValue<BigNumberish>;
    emitterChainId: PromiseOrValue<BigNumberish>;
    emitterAddress: PromiseOrValue<BytesLike>;
    sequence: PromiseOrValue<BigNumberish>;
    consistencyLevel: PromiseOrValue<BigNumberish>;
    payload: PromiseOrValue<BytesLike>;
    guardianSetIndex: PromiseOrValue<BigNumberish>;
    signatures: WormholeStructs.SignatureStruct[];
    hash: PromiseOrValue<BytesLike>;
  };

  export type VMStructOutput = [
    number,
    number,
    number,
    number,
    string,
    BigNumber,
    number,
    string,
    number,
    WormholeStructs.SignatureStructOutput[],
    string
  ] & {
    version: number;
    timestamp: number;
    nonce: number;
    emitterChainId: number;
    emitterAddress: string;
    sequence: BigNumber;
    consistencyLevel: number;
    payload: string;
    guardianSetIndex: number;
    signatures: WormholeStructs.SignatureStructOutput[];
    hash: string;
  };
}

export interface IWormholeInterface extends utils.Interface {
  functions: {
    "chainId()": FunctionFragment;
    "getCurrentGuardianSetIndex()": FunctionFragment;
    "getGuardianSet(uint32)": FunctionFragment;
    "getGuardianSetExpiry()": FunctionFragment;
    "governanceActionIsConsumed(bytes32)": FunctionFragment;
    "governanceChainId()": FunctionFragment;
    "governanceContract()": FunctionFragment;
    "isInitialized(address)": FunctionFragment;
    "messageFee()": FunctionFragment;
    "parseAndVerifyVM(bytes)": FunctionFragment;
    "parseVM(bytes)": FunctionFragment;
    "publishMessage(uint32,bytes,uint8)": FunctionFragment;
    "verifySignatures(bytes32,(bytes32,bytes32,uint8,uint8)[],(address[],uint32))": FunctionFragment;
    "verifyVM((uint8,uint32,uint32,uint16,bytes32,uint64,uint8,bytes,uint32,(bytes32,bytes32,uint8,uint8)[],bytes32))": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "chainId"
      | "getCurrentGuardianSetIndex"
      | "getGuardianSet"
      | "getGuardianSetExpiry"
      | "governanceActionIsConsumed"
      | "governanceChainId"
      | "governanceContract"
      | "isInitialized"
      | "messageFee"
      | "parseAndVerifyVM"
      | "parseVM"
      | "publishMessage"
      | "verifySignatures"
      | "verifyVM"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "chainId", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getCurrentGuardianSetIndex",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getGuardianSet",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getGuardianSetExpiry",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "governanceActionIsConsumed",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "governanceChainId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "governanceContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isInitialized",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "messageFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "parseAndVerifyVM",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "parseVM",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "publishMessage",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "verifySignatures",
    values: [
      PromiseOrValue<BytesLike>,
      WormholeStructs.SignatureStruct[],
      WormholeStructs.GuardianSetStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyVM",
    values: [WormholeStructs.VMStruct]
  ): string;

  decodeFunctionResult(functionFragment: "chainId", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentGuardianSetIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getGuardianSet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getGuardianSetExpiry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "governanceActionIsConsumed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "governanceChainId",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "governanceContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isInitialized",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "messageFee", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "parseAndVerifyVM",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "parseVM", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "publishMessage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifySignatures",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "verifyVM", data: BytesLike): Result;

  events: {
    "LogMessagePublished(address,uint64,uint32,bytes,uint8)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "LogMessagePublished"): EventFragment;
}

export interface LogMessagePublishedEventObject {
  sender: string;
  sequence: BigNumber;
  nonce: number;
  payload: string;
  consistencyLevel: number;
}
export type LogMessagePublishedEvent = TypedEvent<
  [string, BigNumber, number, string, number],
  LogMessagePublishedEventObject
>;

export type LogMessagePublishedEventFilter =
  TypedEventFilter<LogMessagePublishedEvent>;

export interface IWormhole extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IWormholeInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    chainId(overrides?: CallOverrides): Promise<[number]>;

    getCurrentGuardianSetIndex(overrides?: CallOverrides): Promise<[number]>;

    getGuardianSet(
      index: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[WormholeStructs.GuardianSetStructOutput]>;

    getGuardianSetExpiry(overrides?: CallOverrides): Promise<[number]>;

    governanceActionIsConsumed(
      hash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    governanceChainId(overrides?: CallOverrides): Promise<[number]>;

    governanceContract(overrides?: CallOverrides): Promise<[string]>;

    isInitialized(
      impl: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    messageFee(overrides?: CallOverrides): Promise<[BigNumber]>;

    parseAndVerifyVM(
      encodedVM: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [WormholeStructs.VMStructOutput, boolean, string] & {
        vm: WormholeStructs.VMStructOutput;
        valid: boolean;
        reason: string;
      }
    >;

    parseVM(
      encodedVM: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [WormholeStructs.VMStructOutput] & { vm: WormholeStructs.VMStructOutput }
    >;

    publishMessage(
      nonce: PromiseOrValue<BigNumberish>,
      payload: PromiseOrValue<BytesLike>,
      consistencyLevel: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    verifySignatures(
      hash: PromiseOrValue<BytesLike>,
      signatures: WormholeStructs.SignatureStruct[],
      guardianSet: WormholeStructs.GuardianSetStruct,
      overrides?: CallOverrides
    ): Promise<[boolean, string] & { valid: boolean; reason: string }>;

    verifyVM(
      vm: WormholeStructs.VMStruct,
      overrides?: CallOverrides
    ): Promise<[boolean, string] & { valid: boolean; reason: string }>;
  };

  chainId(overrides?: CallOverrides): Promise<number>;

  getCurrentGuardianSetIndex(overrides?: CallOverrides): Promise<number>;

  getGuardianSet(
    index: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<WormholeStructs.GuardianSetStructOutput>;

  getGuardianSetExpiry(overrides?: CallOverrides): Promise<number>;

  governanceActionIsConsumed(
    hash: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  governanceChainId(overrides?: CallOverrides): Promise<number>;

  governanceContract(overrides?: CallOverrides): Promise<string>;

  isInitialized(
    impl: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  messageFee(overrides?: CallOverrides): Promise<BigNumber>;

  parseAndVerifyVM(
    encodedVM: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<
    [WormholeStructs.VMStructOutput, boolean, string] & {
      vm: WormholeStructs.VMStructOutput;
      valid: boolean;
      reason: string;
    }
  >;

  parseVM(
    encodedVM: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<WormholeStructs.VMStructOutput>;

  publishMessage(
    nonce: PromiseOrValue<BigNumberish>,
    payload: PromiseOrValue<BytesLike>,
    consistencyLevel: PromiseOrValue<BigNumberish>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  verifySignatures(
    hash: PromiseOrValue<BytesLike>,
    signatures: WormholeStructs.SignatureStruct[],
    guardianSet: WormholeStructs.GuardianSetStruct,
    overrides?: CallOverrides
  ): Promise<[boolean, string] & { valid: boolean; reason: string }>;

  verifyVM(
    vm: WormholeStructs.VMStruct,
    overrides?: CallOverrides
  ): Promise<[boolean, string] & { valid: boolean; reason: string }>;

  callStatic: {
    chainId(overrides?: CallOverrides): Promise<number>;

    getCurrentGuardianSetIndex(overrides?: CallOverrides): Promise<number>;

    getGuardianSet(
      index: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<WormholeStructs.GuardianSetStructOutput>;

    getGuardianSetExpiry(overrides?: CallOverrides): Promise<number>;

    governanceActionIsConsumed(
      hash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    governanceChainId(overrides?: CallOverrides): Promise<number>;

    governanceContract(overrides?: CallOverrides): Promise<string>;

    isInitialized(
      impl: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    messageFee(overrides?: CallOverrides): Promise<BigNumber>;

    parseAndVerifyVM(
      encodedVM: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<
      [WormholeStructs.VMStructOutput, boolean, string] & {
        vm: WormholeStructs.VMStructOutput;
        valid: boolean;
        reason: string;
      }
    >;

    parseVM(
      encodedVM: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<WormholeStructs.VMStructOutput>;

    publishMessage(
      nonce: PromiseOrValue<BigNumberish>,
      payload: PromiseOrValue<BytesLike>,
      consistencyLevel: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    verifySignatures(
      hash: PromiseOrValue<BytesLike>,
      signatures: WormholeStructs.SignatureStruct[],
      guardianSet: WormholeStructs.GuardianSetStruct,
      overrides?: CallOverrides
    ): Promise<[boolean, string] & { valid: boolean; reason: string }>;

    verifyVM(
      vm: WormholeStructs.VMStruct,
      overrides?: CallOverrides
    ): Promise<[boolean, string] & { valid: boolean; reason: string }>;
  };

  filters: {
    "LogMessagePublished(address,uint64,uint32,bytes,uint8)"(
      sender?: PromiseOrValue<string> | null,
      sequence?: null,
      nonce?: null,
      payload?: null,
      consistencyLevel?: null
    ): LogMessagePublishedEventFilter;
    LogMessagePublished(
      sender?: PromiseOrValue<string> | null,
      sequence?: null,
      nonce?: null,
      payload?: null,
      consistencyLevel?: null
    ): LogMessagePublishedEventFilter;
  };

  estimateGas: {
    chainId(overrides?: CallOverrides): Promise<BigNumber>;

    getCurrentGuardianSetIndex(overrides?: CallOverrides): Promise<BigNumber>;

    getGuardianSet(
      index: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getGuardianSetExpiry(overrides?: CallOverrides): Promise<BigNumber>;

    governanceActionIsConsumed(
      hash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    governanceChainId(overrides?: CallOverrides): Promise<BigNumber>;

    governanceContract(overrides?: CallOverrides): Promise<BigNumber>;

    isInitialized(
      impl: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    messageFee(overrides?: CallOverrides): Promise<BigNumber>;

    parseAndVerifyVM(
      encodedVM: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    parseVM(
      encodedVM: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    publishMessage(
      nonce: PromiseOrValue<BigNumberish>,
      payload: PromiseOrValue<BytesLike>,
      consistencyLevel: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    verifySignatures(
      hash: PromiseOrValue<BytesLike>,
      signatures: WormholeStructs.SignatureStruct[],
      guardianSet: WormholeStructs.GuardianSetStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    verifyVM(
      vm: WormholeStructs.VMStruct,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    chainId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getCurrentGuardianSetIndex(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getGuardianSet(
      index: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getGuardianSetExpiry(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    governanceActionIsConsumed(
      hash: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    governanceChainId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    governanceContract(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isInitialized(
      impl: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    messageFee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    parseAndVerifyVM(
      encodedVM: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    parseVM(
      encodedVM: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    publishMessage(
      nonce: PromiseOrValue<BigNumberish>,
      payload: PromiseOrValue<BytesLike>,
      consistencyLevel: PromiseOrValue<BigNumberish>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    verifySignatures(
      hash: PromiseOrValue<BytesLike>,
      signatures: WormholeStructs.SignatureStruct[],
      guardianSet: WormholeStructs.GuardianSetStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    verifyVM(
      vm: WormholeStructs.VMStruct,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
