class PeerBuilder {
  constructor({ peerConfig }) {
    this.peerConfig = peerConfig;

    const defaultFuncionValue = () => {};
    this.onError = defaultFuncionValue;
    this.onCallReceived = defaultFuncionValue;
    this.onConnectionOpened = defaultFuncionValue;
    this.onPeerStreamReceived = defaultFuncionValue;
    this.OnCallError = defaultFuncionValue;
    this.onCallClose = defaultFuncionValue;
  }

  setOnCallError(fn) {
    this.OnCallError = fn;

    return this;
  }

  setOnCallClose(fn) {
    this.OnCallClose = fn;

    return this;
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
    call.on('error', error => this.OnCallError(call, error));
    call.on('close', _=> this.onCallClose(call));
    this.onCallReceived(call);
  }

  //adicionar o comportamento dos eventos de call também para quem ligar!
  _preparePeerInstanceFunction(peerModule) {
    class PeerCustomModule extends peerModule {}

    const peerCall = PeerCustomModule.prototype.call;
    const context = this;
    PeerCustomModule.prototype.call = function (id, stream) {
      const call = peerCall.apply(this, [id, stream]);
      //interceptamos a call e adionamos todos os eventos da chama para quem liga também
      context._prepareCallEvent(call);

      return call;
    }

    return PeerCustomModule;
  }

  build() {
    // const peer = new Peer(...this.peerConfig);
    const PeerCustomInstance = this._preparePeerInstanceFunction(Peer);
    const peer = new PeerCustomInstance(...this.peerConfig);
    
    peer.on('error', this.onError);
    peer.on('call', this._prepareCallEvent.bind(this));

    return new Promise(resolve => peer.on('open', id => {
      
      this.onConnectionOpened(peer);
      return resolve(peer);
    }))
  }
}