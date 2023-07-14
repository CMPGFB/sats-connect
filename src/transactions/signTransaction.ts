import { createUnsecuredToken, Json } from 'jsontokens';

import { BitcoinNetwork, GetBitcoinProviderFunc, getDefaultProvider } from '../provider';

export interface InputToSign {
  address: string;
  signingIndexes: Array<number>;
  sigHash?: number;
}

export interface SignTransactionPayload {
  network: BitcoinNetwork;
  message: string;
  psbtBase64: string;
  broadcast?: boolean;
  inputsToSign: InputToSign[];
}

export interface SignTransactionOptions {
  getProvider?: GetBitcoinProviderFunc;
  onFinish: (response: any) => void;
  onCancel: () => void;
  payload: SignTransactionPayload;
}

export interface SignTransactionResponse {
  psbtBase64: string;
  txId?: string;
}

export const signTransaction = async (options: SignTransactionOptions) => {
  const { getProvider = getDefaultProvider } = options;
  const provider = await getProvider();
  if (!provider) {
    throw new Error('No Bitcoin wallet installed');
  }

  const { psbtBase64, inputsToSign } = options.payload;
  if (!psbtBase64) {
    throw new Error('A value for psbtBase64 representing the tx hash is required');
  }
  if (!inputsToSign) {
    throw new Error('An array specifying the inputs to be signed by the wallet is required');
  }

  try {
    const request = createUnsecuredToken(options.payload as unknown as Json);
    const addressResponse = await provider.signTransaction(request);
    options.onFinish?.(addressResponse);
  } catch (error) {
    console.error('[Connect] Error during sign transaction request', error);
    options.onCancel?.();
  }
};
