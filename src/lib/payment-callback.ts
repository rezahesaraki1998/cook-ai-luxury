/** The browser only forwards provider parameters; it never grants a subscription. */
export function paymentVerificationUrl(endpoint: string, params: URLSearchParams): string | null {
  const authority = params.get("Authority");
  const status = params.get("Status");
  if (!authority || !/^[A-Za-z0-9]{10,64}$/.test(authority) || (status !== "OK" && status !== "NOK")) return null;
  const url = new URL("functions/v1/zarinpal-payment", `${endpoint.replace(/\/$/, "")}/`);
  url.searchParams.set("action", "callback");
  url.searchParams.set("Authority", authority);
  url.searchParams.set("Status", status);
  return url.toString();
}