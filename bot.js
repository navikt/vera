var xmpp = require('node-xmpp');

var jid = '1_674@chat.btf.hipchat.com';
var password = '';
var room_jid = '1_aura@conf.btf.hipchat.com'
var room_nick = 'Johnny Horvi'

var cl = new xmpp.Client({
    jid: jid + '/bot',
    password: password
});

cl.on('online', function(){
    console.log('yay, were online');

// set ourselves as online
    cl.send(new xmpp.Element('presence', { type: 'available' }).
            c('show').t('chat')
    );

    // join room (and request no chat history)
    cl.send(new xmpp.Element('presence', { to: room_jid+'/'+room_nick }).
            c('x', { xmlns: 'http://jabber.org/protocol/muc' })
    );

    // send response
    cl.send(new xmpp.Element('message', { to: room_jid+'/'+room_nick, type: 'groupchat' }).
            c('body').t('hei fra bot')
    );

});

cl.on('stanza', function(stanza) {
    console.log('Incoming stanza: ', stanza.toString())
})
