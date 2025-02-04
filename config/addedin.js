const semver = require("semver");
const versions = require("../src/_data/versions");

const MINIMUM_VERSION_SHOWN = "0.11.0";

const COERCE = {
	// should have `v` prefix
	"v2.0.0-canary.": "v2.0.0-beta.1", // 2.0.0-beta.1 => 2.0.0 is handled automatically (see Note 1 below)
}

function isCoreRelease(version) {
	// For version text that starts with a number (plugins don’t do this)
	return ("" + version).match(/^v{0,1}[0-9]/);
}

function isPreRelease(version) {
	return version.includes("-");
}

function isPreReleaseOf(version, releasedVersion) {
	if(!isPreRelease(version)) {
		return false;
	}

	let stableVersion = version.split("-")[0];
	// `version` needs a `v` prefix for this comparison
	return stableVersion === releasedVersion;
}

// coerce -canary to -beta or if stable version is released, strips -canary and -beta
function coerceVersion(version) {
	const newestPublishedVersion = versions.filter(v => v.tag !== "LATEST").shift();
	if(!isCoreRelease(version)) {
		return version;
	}

	let versionText = version;

	if(!versionText.startsWith("v")) {
		versionText = `v${versionText}`;
	}

	// Change all -canary.X to .beta.1
	for(let coerceKey in COERCE) {
		if(versionText.startsWith(coerceKey)) {
			let newVersion = COERCE[coerceKey];
			versionText = newVersion;
		}
	}

	if(isPreReleaseOf(versionText, newestPublishedVersion.tag)) {
		// Note 1: Strip -canary.1 or -beta.1 suffixes after 2.0.0 is shipped
		versionText = versionText.split("-")[0];
	}

	return versionText;
}

function addedIn(version, tag, extraClass) {
	let beforeText = "Added in ";
	if(isCoreRelease(version)) {
		// Show no content for super old version notes
		if(semver.lt(version, MINIMUM_VERSION_SHOWN)) {
			return "";
		}
	}

	tag = tag || "span";

	return `<${tag} class="minilink minilink-addedin${extraClass ? ` ${extraClass}`: ""}" data-uncoerced-version="${version}">${beforeText}${coerceVersion.call(this, version)}</${tag}>`;
}

module.exports = {
	addedIn,
	coerceVersion
};
