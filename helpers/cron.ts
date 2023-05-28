import cron from "node-cron";
import { Client } from "@bnb-chain/greenfield-chain-sdk";

import Provider from "../models/Provider";
import measureLatency from "./measureLatency";
import { rpc } from "../config";
import Statistics from "../models/Statistics";

const client = Client.create(rpc.url, rpc.chainId);

async function sheduleCron() {
  cron.schedule("* * * * *", async () => {
    const dataRequest = await fetch("http://167.71.39.228:3000/getAllStat")
    const dataResponse = await dataRequest.json()

    const sps = await client.sp.getStorageProviders();

    const date = new Date()
    date.setHours(0, 0, 0, 0)

    let stat = await Statistics.findOne({
        date: date.getTime()
    })

    if (!stat) {
        stat = new Statistics({
            date: date.getTime()
        })
    }
    stat.providersCount = sps.length
    stat.transactionsCount = dataResponse.transactions
    await stat.save()

    // update providers
    for (const item of sps) {
      let provider = await Provider.findOne({
        address: item.operatorAddress,
      });

      if (!provider) {
        provider = new Provider({
          address: item.operatorAddress,
          uptime: 0,
        });
      }

      const latency = await measureLatency(item.endpoint);

      if (item.status == 0) {
        provider.uptime += 60000;
      } else {
        provider.uptime = 0;
      }

      provider.latency = latency;

      await provider.save();

      console.log(`${provider.address} updated`);
    }
  });
}

export default sheduleCron;
