import express, { Request, Response } from "express";
import { Client } from "@bnb-chain/greenfield-chain-sdk";
import { ethers } from "ethers";

import { rpc } from "../config";
import Provider from "../models/Provider";
import Statistics from "../models/Statistics";
import getTransaction from "../helpers/getTransaction";

const client = Client.create(rpc.url, rpc.chainId);
const provider = new ethers.providers.JsonRpcProvider(rpc.url);

const router = express.Router();

router.get("/getStat", async (req: Request, res: Response) => {
  try {
    const dataRequest = await fetch("http://167.71.39.228:3000/getAllStat");
    const dataResponse = await dataRequest.json();

    const block = await provider.getBlockNumber();
    const sps = await client.sp.getStorageProviders();

    const providers = await Provider.find({});

    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const stat = await Statistics.find();

    const sumLatency = providers.reduce((total, obj) => total + obj.latency, 0);
    const averageLatency = sumLatency / providers.length;

    res.json({
      data: {
        activeProviders: sps.length,
        activeProvidersGraph: stat
          .sort((a, b) => {
            return a.date - b.date;
          })
          .map((item) => ({
            date: item.date,
            providersCount: item.providersCount,
          })),
        averageLatency,
        latestBlock: block,
        averageBlockTime: dataResponse?.averageBlockTime,
        transactionsCount: dataResponse?.transactions,
        transactionsCountGraph: stat
          .sort((a, b) => {
            return a.date - b.date;
          })
          .map((item) => ({
            date: item.date,
            transactionsCount: item.transactionsCount,
          })),
        accountsCount: dataResponse?.accounts,
      },
    });
  } catch (e) {
    console.log(e);
    res.json({
      error: "Unexpected error",
    });
  }
});

router.get("/getServiceProviders", async (req: Request, res: Response) => {
  const sps = await client.sp.getStorageProviders();

  res.json({
    data: sps
      .filter((item) => item.status == 0)
      .map((sp) => ({
        address: sp.operatorAddress,
        title: sp.description?.moniker,
      })),
  });
});

router.get("/isProvider/:address", async (req: Request, res: Response) => {
  try {
    const sp = await client.sp.getStorageProviderInfo(req.params.address);

    res.json({
      data: sp ? true : false,
    });
  } catch (e) {
    console.log(e);
    res.json({
      data: false,
    });
  }
});

router.get("/getAccount/:address", async (req: Request, res: Response) => {
  try {
    const balance = await provider.getBalance(req.params.address);

    const transactionsRequest = await fetch(
      "http://167.71.39.228:3000/transactionsByAddress/" + req.params.address
    );
    const transactionsResponse = await transactionsRequest.json();

    res.json({
      data: {
        balance: Number(balance) / Math.pow(10, 18),
        transactions: transactionsResponse.data,
      },
    });
  } catch (e) {
    console.log(e);
    res.json({
      error: "Unexpected error",
    });
  }
});

router.get(
  "/getServiceProvider/:address",
  async (req: Request, res: Response) => {
    try {
      const sp = await client.sp.getStorageProviderInfo(req.params.address);
      const price = await client.sp.getStoragePriceByTime(req.params.address);
      const balance = await provider.getBalance(req.params.address);

      const transactionsRequest = await fetch(
        "http://167.71.39.228:3000/transactionsByAddress/" + req.params.address
      );
      const transactionsResponse = await transactionsRequest.json();

      const providerInfo = await Provider.findOne({
        address: sp?.operatorAddress,
      });

      res.json({
        data: {
          provider: {
            title: sp?.description?.moniker,
            operatorAddress: sp?.operatorAddress,
            fundingAddress: sp?.fundingAddress,
            sealAddress: sp?.sealAddress,
            approvalAddress: sp?.approvalAddress,
            endpoint: sp?.endpoint,
            status: sp?.status == 0 ? "ACTIVE" : "UNACTIVE",
            deposit: Number(sp?.totalDeposit) / Math.pow(10, 18),
            balance: Number(balance) / Math.pow(10, 18),
          },
          price: {
            readPrice: Number(price?.readPrice) / Math.pow(10, 18),
            storePrice: Number(price?.storePrice) / Math.pow(10, 18),
          },
          kpi: {
            latency: providerInfo?.latency,
            uptime: providerInfo?.uptime,
          },
          transactions: transactionsResponse.data,
        },
      });
    } catch (e) {
      console.log(e);
      res.json({
        error: "Unexpected error",
      });
    }
  }
);

router.get("/getTransactions", async (req: Request, res: Response) => {
  try {
    const transactionsRequest = await fetch(
      "http://167.71.39.228:3000/transactions"
    );
    const transactionsResponse = await transactionsRequest.json();

    res.json({
      data: transactionsResponse,
    });
  } catch (e) {
    console.log(e);
    res.json({
      error: "Unexpected error",
    });
  }
});

router.get("/getTransaction/:hash", async (req: Request, res: Response) => {
  try {
    const info = await getTransaction(req.params.hash)

    const blockRequest = await fetch(
      "http://167.71.39.228:3000/block/" + info.result.height
    );
    const blockResponse = await blockRequest.json();

    res.json({
      data: {
        hash: req.params.hash,
        block: info.result.height,
        time: blockResponse.time,
        gas: {
          maxGas: info.result.tx_result.gas_wanted,
          usedGas: info.result.tx_result.gas_used
        },
        logs: JSON.parse(info.result.tx_result.log)
      }
    })
  } catch (e) {
    console.log(e);
    res.json({
      error: "Unexpected error",
    });
  }
});

router.get("/getBlocks", async (req: Request, res: Response) => {
  try {
    const blocksRequest = await fetch(
      "http://167.71.39.228:3000/getLastBlocks"
    );
    const blocksResponse = await blocksRequest.json();

    res.json({
      data: blocksResponse,
    });
  } catch (e) {
    console.log(e);
    res.json({
      error: "Unexpected error",
    });
  }
});

router.get("/getBlock/:block", async (req: Request, res: Response) => {
  try {
    const blockRequest = await fetch(
      "http://167.71.39.228:3000/block/" + req.params.block
    );
    const blockResponse = await blockRequest.json();

    const blockTransactionsRequest = await fetch(
      "http://167.71.39.228:3000/transactionsByBlock/" + req.params.block
    );
    const blockTransactionsResponse = await blockTransactionsRequest.json();

    const blockInfoRequest = await fetch(
      "https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org/block?height=" + req.params.block
    );
    const blockInfoResponse = await blockInfoRequest.json();

    res.json({
      data: {
        ...blockResponse,
        signatures: blockInfoResponse.result.block.last_commit.signatures.map((item: any) => ({
          validator_address: item?.validator_address,
          timestamp: item?.timestamp
        })),
        transactions: blockTransactionsResponse.data,
      },
    });
  } catch (e) {
    console.log(e);
    res.json({
      error: "Unexpected error",
    });
  }
});

export default router;
