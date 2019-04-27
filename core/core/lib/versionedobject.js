class VersionedObject {
  constructor() {
    this.data = {};
    this.latestData = {};
    this.latestVersions = {};
  }

  getLatest(label) {
    return this.latestData[label];
  }

  getVersion(label, version) {
    return this.data[label][version];
  }

  getLatestVersion(label) {
    return this.latestVersions[label];
  }

  setVersion(label, version, value) {
    if( this.data[label] === undefined ) {
      this.data[label] = {};
      this.latestData[label] = value;
      this.latestVersions[label] = version;
    }
    this.data[label][version] = value;
  }

  setLatest(label, version) {
    this.latestData[label] = this.data[label][version];
    this.latestVersions[label] = version;
  }
}

module.exports = VersionedObject;