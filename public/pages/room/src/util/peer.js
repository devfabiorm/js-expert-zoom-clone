class PeerBuilder {
  constructor({ peerConfig }) {
    this.peerConfig = peerConfig;

    const defaultFuncionValue = () => {};
    this.onError = defaultFuncionValue;
    this.onCallReceived = defaultFuncionValue;
    this.onConnectionOpened = defaultFuncionValue;
    this.onPeerStreamReceived = defaultFuncionValue;
  }

  setOnError(fn) {
    this.onError = fn;

    return this;
  }

  setOnCallReceived(fn) {
    this.onCallReceived = fn;

    return this;
  }

  setOnConnectionOpened(fn) {
    this.onConnectionOpened = fn;

    return this;
  }

  setOnPeerStreamReceived(fn) {
    this.onPeerStreamReceived = fn;

    return this;
  }

  _prepareCallEvent(call) {
    call.on('stream', stream => this.onPeerStreamReceived(call, stream));

    this.onCallReceived(call);
  }

  build() {
    const peer = new Peer(...this.peerConfig);

    peer.on('error', this.onError);
    peer.on('call', this._prepareCallEvent.bind(this));

    return new Promise(resolve => peer.on('open', id => {
      
      this.onConnectionOpened(peer);
      return resolve(peer);
    }))
  }
}