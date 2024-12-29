import { analyzeDomain } from "../utils/domainChecker";


export function extractDomain(origin: string) {
  const domain = analyzeDomain(origin);
  if (domain) {
    return domain.domain;
  } else {
    return undefined
  }
}

export function isProdOrigin(origin: string) {
  return analyzeDomain(origin).environment !== null
}

export function isProdDomain(domain: string) {
  // Prefix with some protocol, so a naked domain like `.ghn.tech` looks like
  // an `origin` and can match our patterns.
  return analyzeDomain(domain).environment !== null
}
