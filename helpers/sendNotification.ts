async function sendNotification(
  interests: string[],
  title: any,
  text: string
) {
  const req = await fetch(
    `https://e9c7df1d-fdc0-4cbb-b044-e7f005a89e85.pushnotifications.pusher.com/publish_api/v1/instances/e9c7df1d-fdc0-4cbb-b044-e7f005a89e85/publishes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer F876D446DB7C5C9BFD5B357A0FCD465E9C28E29310421E1669489E4F147AFC5E",
      },
      body: JSON.stringify({
        interests: interests,
        web: {
          notification: {
            title: title,
            body: text,
          },
        },
      }),
    }
  );

  const res = await req.json()
  

  return res
}

export default sendNotification