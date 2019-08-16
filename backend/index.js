const       express     = require('express');
            app         = express();
            bodyParser  = require('body-parser')
            uuid        = require('uuid')
            port        = 5000
            pgp         = require('pg-promise')(/* options */)
            db          = pgp('postgres://postgres:secret@db:5432/database'),
            wsserver    = require('websocket').server

app.use(bodyParser.json())

// USER ROUTES
//================================

// ROOT / -> /user

app.get('/', (req, res) => {
    res.redirect('/user')
})

// GET /user Login Page (combination new user and login form)

app.get('/user', (req, res) =>(
    res.send("User page")
))

// GET /user/new Form for new user

app.get('/user/new', (req, res) => {
    res.send('New User Page')
})

// GET /user/:userName -> /user/:userName/chats

app.get('/user/:userName', (req, res) => {
    // TODO change into db lookup instead of has in local set    
    const user = req.params.userName  

    db.task( t =>{
        let data;
        data = t.one(
            'SELECT * FROM member WHERE name=$1', user
            )
        return data
        }
    ).then(
        data => {
            if(data) {
                res.json({redirect: data.id}) // This redirects into chatrooms view for that specific user
            } else {
                res.json({redirect: 'new'})
            }
        }
    ).catch( err => {
            console.log(err)
            res.json({redirect: 'new'})
        }
    )
})

// POST /user New User Push to db

app.post('/user', (req, res) => {
    let id = uuid()
    let user = req.body.name
    console.log(user + ' ' + id)
    db.task(t => {
        return t.one(
            'INSERT INTO member (name, id) VALUES ($1, $2) RETURNING name, id', [user, id]
            ).then(data => {
                console.log('Created user with name: ' + data.name + ', and ID: ' + data.id)        
                res.json({redirect: data.name})
            })
    }).catch(err=> {
        console.log(err)
    })
})

//================================


// CHAT ROUTES
//================================

// GET /user/:userName/chats Show page for all chats

app.get('/user/:userName/chats', (req, res) => {    
    let user = req.params.userName
    console.log('chats route')
    // Get all chats where user is member TODO might wanna do this through id

    db.task(t=>{
        return t.one('SELECT ARRAY_AGG(ROW_TO_JSON(t)) from (SELECT * FROM chat WHERE $1 = ANY (members)) t', user)
            .then( data => {
                if(data){
                    console.log(data.array_agg)
                    res.json({chats: data.array_agg})
                }
            })
    }).catch(err => {
        console.log(err)
        res.json({redirect: 'new'})
    })
})

// GET /user/:userName/chats/new Form for new chatroom creation

// POST /user/:userName/chats Post request for new chatroom

app.post('/user/:userName/chats', (req, res) => {  

    console.log(req.body)

    const {name, color} = req.body
    const id = uuid()
    const user = req.params.userName

    db.task(t => {
        return t.one(
            'INSERT INTO chat (id, name, owner, color, members) VALUES ($1, $2, $3, $4, $5) RETURNING id', [id, name, user, color, [user]]
            ).then(data => {
                console.log('Created chat with name: ' + name + ', and ID: ' + data.id)        
                res.json({redirect: data.id})
            })
    }).catch(err=> {
        console.log(err)
        res.send('Something went wrong')
    })
})

// GET /user/:userName/chats/:chatName Show page for specific chatroom -> /user/:userName/chats/:chatName/messages
app.get('/user/:userName/chats/:chatName', (req, res) => {
    db.task(t => {
        return t.any('SELECT id, members FROM chat WHERE name=$1', req.params.chatName
        ).then(data => {
            console.log(data)
            if(data.length === 0){
                res.json({redirect: 'chats/new'})
                return
            }
            if(data[0].members.includes(req.params.userName)) {
                res.json({redirect: 'chats/' + data.id})
                return
            } else {
                const id = data[0].id
                let members = data[0].members
                members.push(req.params.userName)

                db.task(t => {
                    return t.one('UPDATE chat SET members=$2 WHERE id=$1 RETURNING id', [id, members])
                        .then(data => {
                            console.log(data)
                            res.json({redirect: 'chats/' + data.id})
                        })
                }).catch(err => {
                    console.log(err)
                    res.json({message: 'Something went wrong'})
                })
            }
        })
    }).catch(err => {
        console.log(err)
        res.json({message: 'Something went wrong'})
    })
})

// EDIT /user/:userName/chats/:chatName/edit Edit form for chatroom (edit name and delete routes)

// PUT /user/:userName/chats/:chatName
app.put('/user/:userId/chats/:chatId', (req, res) => {
    console.log(req.body)
    let owner;
    db.task(t => {
        return t.one(
            'SELECT owner FROM chat WHERE id=$1', req.params.chatId
        ).then(data => {
            console.log(data.owner)
            owner = data.owner
            if(req.params.userId !== owner) {
        
                console.log('Permission denied: Owner is: ' + owner + ' User is: ' + req.params.userId)
                res.json({message: 'Permission denied'})
                return;
            } else {
                db.task(t => {
                    
                    return t.one(
                        'UPDATE chat SET name=$2, color=$3 WHERE id=$1 RETURNING id', [req.params.chatId, req.body.name, req.body.color], 
                        ).then(data => {
                            console.log(data)
                            
                            // WEBHOOK TO MAKE CLIENTS UPDATE NAME AND COLOR
                            res.json({redirect: data})
                    })
                }).catch( err => {
                    console.log(err)
                    res.send('Something went wrong')
                })
            }
        })
    }).catch(err => {
        console.log(err)
        req.send('Something went wrong')
    })    
})

// DELETE /user/:userName/chats/:chatName
app.delete('/user/:userId/chats/:chatId', (req, res) => {

    db.task(t => {
        return t.one('SELECT id, owner FROM chat WHERE id=$1' , req.params.chatId)
            .then(data => {
                if(data.owner === req.params.userId) {
                    db.tx( t => {
                        return t.batch([
                            t.none('DELETE FROM chat WHERE id=$1', data.id),
                            t.none('DELETE FROM message WHERE chat=$1', data.id) 
                        ]).then( data => {
                            console.log(data)
                            res.json({message: 'removed'})
                        })         
                    })
                } else {
                    console.log('Permission denied')
                    res.json({message: 'Permission denied'})
                }
            })
        }            
    ).catch(err => {
        console.log(err)
    })
})

//================================

// MESSAGES ROUTES
//================================

// GET /user/:userName/chats/:chatName/messages Show page for all messages in a chatroom
app.get('/user/:userId/chats/:chatId/show', (req, res) => {
    db.task( t => {
        return t.any('SELECT * FROM message WHERE chat=$1', req.params.chatId)
            .then( data => {
                res.json({messages: data})})
    }).catch( err => {
        console.log(err)
    })
})

// POST /user/:userName/chats/:chatName/messages Post new comment to chatroom
app.post('/user/:userId/chats/:chatId', (req, res) => {
    let socketMessage
    db.tx( t => {
        const   id      = uuid();
                message = req.body.message
                chat    = req.params.chatId;
                from    = req.params.userId
                date    = new Date();
        socketMessage = {id: id, message: message, by: from, date: date, chat: chat}
        return t.batch([
            t.any('INSERT INTO message (id, chat, by, date, message) VALUES ($1, $2, $3, $4, $5) RETURNING *', [id, chat, from, date, message]),
            t.one('SELECT members FROM chat WHERE id=$1', req.params.chatId)
            ])
            .then( data => {            
                let members = data[1].members
                users.forEach(user => {
                    if(members.includes(user.name)){
                        user.connection.sendUTF(JSON.stringify({message: socketMessage, chatId: req.params.chatId}))
                        console.log('sent socket to grab new messages')
                    }
                })
                res.json({data: data})
            })        
    }).catch( err => {
        console.log(err)
    })
})

//================================

// WEBSOCKET SETUP

const http = require('http')
const server = http.createServer((req, res) => {
    console.log((new Date()) + ' Recieved request for ' + req.url);
    res.writeHead(404)
    res.end()
})
server.listen(5001, () => {
    console.log((new Date()) + ' Server is listening on port 5001');
});

const webSocketServer = new wsserver({
    httpServer: server,
    autoAcceptConnections: false
})

function originIsAllowed(origin){
    return true;
}

var users = new Set()

webSocketServer.on('request', (req) => {
    if(!originIsAllowed(req.origin)){
        req.reject()
        console.log((new Date()) + ' Connection from origin ' + req.origin + ' rejected')
        return;
    }

    var connection = req.accept('echo-protocol', req.origin);
    console.log((new Date()) + ' Connection accepted')

    connection.on('message', (m => {
        let name = JSON.parse(m.utf8Data).name
        users.add({name: name, connection: connection})
    }))

    connection.on('close', (reason, desc) => {
        users.forEach(user => {
            if(user.connection === connection){
                users.delete(user)
            }
        })
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.')
    })
})

app.listen(port, () => (console.log(`Backend Server started on port: ${port}`)))