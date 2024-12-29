import * as React from 'react';

import cmp from 'semver-compare';

import packageJSON from '../../package.json';

enum VersionStatus {
  Unknown,
  Loading,
  UpToDate,
  Behind,
}

type ReleasesResponse = {[key: string]: unknown; tag_name: string};

function useReleasedVersions({currentVersion}: {currentVersion: string}) {
  const [{status, data}, setReleases] = React.useState<{
    status: number;
    data: undefined | ReleasesResponse[];
  }>({
    status: 0,
    data: undefined,
  });

  const fetchReleases = async () => {
    const response = await fetch(
      'https://api.github.com/repos/comehere127/ghn-sync-cookie/releases'
    );
    setReleases({
      status: response.status,
      data: (await response.json()) as ReleasesResponse[],
    });
  };

  React.useEffect(() => {
    fetchReleases();
  }, []);

  if (status === 0) {
    return {status: VersionStatus.Loading};
  }
  if (status >= 200 && status < 300) {
    const tags = data?.map((release) => release.tag_name.replace(/^v/, ''));
    const newestRelease = tags?.sort(cmp).pop() || '0.0.0';
    return cmp(newestRelease, currentVersion) === 1
      ? {status: VersionStatus.Behind}
      : {status: VersionStatus.UpToDate};
  }
  if (status >= 400) {
    return {status: VersionStatus.Behind};
  }
  return {status: VersionStatus.Unknown};
}

export default function VersionBadge() {
  const {status} = useReleasedVersions({
    currentVersion: packageJSON.version,
  });

  switch (status) {
    case VersionStatus.Loading:
      return (
        <div className="current-version">
          <div className="spinner" />
          Your version: {packageJSON.version}
        </div>
      );
    case VersionStatus.UpToDate:
      return (
        <div className="current-version">
          Your version (up to date): {packageJSON.version}
        </div>
      );
    case VersionStatus.Behind:
      return (
        <div className="current-version">
          <div>Your version: {packageJSON.version}</div>
          <div>
            A{' '}
            <a
              href="https://github.com/comehere127/ghn-sync-cookie/releases"
              target="_blank"
              rel="noreferrer"
            >
              newer version
            </a>{' '}
            is available
          </div>
        </div>
      );
    default:
      return null;
  }
}
