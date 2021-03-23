import express from 'express';
import lib from '../helper/handler.js';
import jwt from 'jsonwebtoken';
const router = express.Router();
let users = [];

function verifyToken(req, res, next) {
    let token = req.headers.authorization;
    if (!token) {
        res.status(401).send({
            error: 'Unauthorized request'
        });
    } else {
        let payload = {};
        
        try {
            payload = jwt.verify(token, 'secret');
        } catch(err) {
            console.log(err);
            res.status(401).send({
                error: 'Unauthorized request'
            });
        }
        console.log('payload: ', payload);
        if(!payload) {
            res.status(401).send({
                error: 'Unauthorized request'
            });
        }
    }
    next();
}

lib.read((err, data) => {
    if (data) {
        users = data;
    }
});

router.get('/loggedUser', verifyToken, (req, res) => {
    let userEmail = jwt.verify(req.headers.authorization, 'secret').user.email;
    let loggedUser = users.find((user) => {
        return user.email === userEmail;
    });
    if (loggedUser) {
        res.send({
            user: {
                ...loggedUser,
                password: '****'
            }
        })
    } else {
        res.status(401).send({
            error: 'Invalid token'
        })
    }
});

router.get('/', (req, res) => {
    lib.read((err, data) => {
        if (!err && data) {
            res.send(data);
        } else {
            res.status(500).send({
                error: err
            });
        }
    });
});

router.post('/', (req, res) => {
    const newUser = req.body;
    let usersOperation = [...users];
    let userIndex = usersOperation.findIndex(user=>{
        return user.email === newUser.email;
    });
    if(userIndex === -1) {
        usersOperation.push({
            ...newUser,
            userType: 'normal'
        });
        //Open the file
        lib.update(usersOperation, (err) => {
            if(!err) {
                users = usersOperation;
                res.send({
                    post: 'success',
                    data: usersOperation
                });
            } else {
                res.status(500).send({
                    post: 'error',
                    data: 'Internal Server error'
                });
            }
        });
    } else {
        res.status(400).send({
            post: 'error',
            data: 'User with provided email already exists'
        })
    }
});

router.put('/:id', verifyToken, (req, res) => {
    // res.send(req.params.id);
    let index = users.findIndex(user => {
        return user.email === req.params.id;
    });

    if(index >= 0) {
        let usersToUpdate = [...users];
        usersToUpdate[index].phoneNumber = req.body.phoneNumber ? req.body.phoneNumber : usersToUpdate[index].phoneNumber;
        usersToUpdate[index].password = req.body.password && (req.body.password !== '****') ? req.body.password : usersToUpdate[index].password;
        
        usersToUpdate[index].address.street = req.body.address.street ? req.body.address.street : usersToUpdate[index].address.street;
        usersToUpdate[index].address.state = req.body.address.state ? req.body.address.state : usersToUpdate[index].address.state;
        
        usersToUpdate[index].address.zip = req.body.address.zip ? req.body.address.zip : usersToUpdate[index].address.zip;
        usersToUpdate[index].address.city = req.body.address.city ? req.body.address.city : usersToUpdate[index].address.city;
        
        lib.update(usersToUpdate, (err) => {
            if(!err) {
                users = usersToUpdate;
                res.send({
                    post: 'success',
                    data: usersToUpdate[index]
                });
            } else {
                res.status(500).send({
                    post: 'error',
                    data: 'Internal Server error'
                });
            }
        });

    } else {
        res.status(400).send({
            err: 'User not found'
        });
    }
});

router.delete('/:id', verifyToken, (req, res) => {
    let userEmailToDelete = req.params.id;

    let index = users.findIndex(user => {
        return user.email === userEmailToDelete;
    });
    console.log('index: ', index);
    console.log('1: ', users.length);
    if(index >= 0) {
        let newUsers = [...users];
        newUsers.splice(index, 1);
        
        lib.update(newUsers, (err) => {
            if(!err) {
                users = newUsers;
                console.log('2: ', users.length);
                res.send({
                    post: 'deletion success'
                });
            } else {
                res.status(500).send({
                    post: 'error',
                    data: 'Internal Server error'
                });
            }
        });

    } else {
        res.status(400).send({
            post: 'error',
            data: 'User with provided email already exists'
        })
    }
});

router.post('/login', (req, res) => {
    const loginCredentials = req.body;
    if (!loginCredentials.email && !loginCredentials.password) {
        res.status(401).send({
            error: 'Invalid credentials'
        });
    } else {
        let userRequested = users.find(user => {
            return (user.email === loginCredentials.email) && (user.password === loginCredentials.password);
        });
        if (!!userRequested) {
            var token = jwt.sign({ user: userRequested }, 'secret');
            res.send({
                token: token,
                userData: {
                    ...userRequested,
                    password: '****'
                }
            });
        } else {
            res.status(401).send({
                error: 'Invalid credentials'
            });
        }
    }
});



export default router;
