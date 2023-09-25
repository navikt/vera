export default function versionCompare (versionA: string, versionB: string): 0 | 1 | -1 | null {
  if (versionA === versionB) {
    return 0;
  }

  if (!comparableVersion(versionA) || !comparableVersion(versionB)) {
    return null;
  }

  return vercmp(versionA, versionB);
}

function vercmp(versionA: string, versionB: string): 0 | 1 | -1 {
  const EVERYTHING_AFTER_DASH = /-.*/; //will stip away everything after dash (-) we only want da numbaz
  const versionASequence = versionA.replace(EVERYTHING_AFTER_DASH, '').split('.').map(Number);
  const versionBSequence = versionB.replace(EVERYTHING_AFTER_DASH, '').split('.').map(Number);

  const diff1 = versionBSequence.length - versionASequence.length;
  for (let i = 0; i < Math.max(diff1, 0); i++) {
    versionASequence.push(0);
  }

  const diff2 = versionASequence.length - versionBSequence.length;
  for (let i = 0; i < Math.max(diff2, 0); i++) {
    versionBSequence.push(0);
  }

  for (let i = 0; i < versionASequence.length; i++) {
    if (versionASequence[i] === versionBSequence[i]) {
      continue;
    }
    if (versionASequence[i] < versionBSequence[i]) {
      return -1;
    }
    if (versionASequence[i] > versionBSequence[i]) {
      return 1;
    }
  }

  if (versionA.includes('SNAPSHOT')) {
    return -1;
  }

  if (versionB.includes('SNAPSHOT')) {
    return 1;
  }

  return 0;
}

// Will match versions like 1, 1.2, 1.2.3, 1.2.3-SNAPSHOT
// but not 2.0.0-mod-alpha69, QASS294.14HL4.0 and other bat chit crazy version numbers
// will also match an optional "metadata" part such as 1.2.3-HL3 and 1.2.3-HL3-SNAPSHOT
function comparableVersion(version: string): boolean {
  const parsableVersionPattern = /^[0-9]+(\.[0-9]+)*(-[a-zA-Z0-9_]+)?(-SNAPSHOT)?$/;
  return parsableVersionPattern.test(version);
}
