var rtcp = new RTCPeerConnection()
var dc = rtcp.createDataChannel("sample data channel");


RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;

// v; version
// o; originator and session identifier
// s; sessionname
// t; time the session is active
// a; zero or more session attribute lines
var desc = new RTCSessionDescription();
desc.sdp = `
  v=0
  o=4772594721209878780 2 IN IP4 127.0.0.1
  s=
  t=0 0
  a=group:BUNDLE 0
  a=extmap-allow-mixed
  a=msid-semantic: WM
  m=application 9 UDP/DTLS/SCTP webrtc-datachannel
  c=IN IP4 0.0.0.0
  a=ice-ufrag:GU3q
  a=ice-pwd:C8ZsltL7hcAx5kMxQPysFJ6N
  a=ice-options:trickle
  a=fingerprint:sha-256 DF:95:D5:72:58:D4:24:26:E2:5E:70:7E:AB:AB:0D:3E:BE:08:69:38:97:80:05:A8:DC:81:8B:40:75:43:6F:1E
  a=setup:actpass
  a=mid:0
  a=sctp-port:5000
  a=max-message-size:262144
`

rtcp.createOffer().then(function(offer) {
  rtcp.setLocalDescription(offer);
})
console.log(rtcp.localDescription());
