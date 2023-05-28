async function measureLatency(url: string): Promise<number> {
  try {
    const startTime = new Date().getTime();

    const req = await fetch(url);
    const res = await req.text();

    const endTime = new Date().getTime();
    const latency = endTime - startTime;

    return latency;
  } catch (e) {
    return 0;
  }
}

export default measureLatency;
