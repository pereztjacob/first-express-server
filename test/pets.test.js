const { assert } = require('chai');
const request = require('./request');
const Pet = require('../lib/models/model');

describe('pets API', () => {

    let tigerShark = {
        name: 'tiger',
        size: 'decent',
    };

    let rhino = {
        name: 'rhinocerus',
        size: 'big'
    };

    it('posts pet', () => {
        return request
            .post('/pets')
            .send(rhino)
            .then(({ body }) => {
                const { _id } = body;
                assert.ok(_id);
                assert.deepEqual(body, { _id, ...rhino });
                rhino = body;
                return _id;
            })
            .then(_id => Pet.findById(_id))
            .then(found => {
                assert.deepEqual(found, rhino);
            });
    });

    it('gets all pets', () => {
        return request
            .get('/pets')
            .then(({ body }) => {
                assert.deepEqual(body, [rhino]);
            });
    });

    it('get a pet by id', () => {
        return Pet.save(tigerShark)
            .then(saved => {
                tigerShark = saved;
                return request.get(`/pets/${tigerShark._id}`);
            })
            .then(({ body }) => {
                assert.deepEqual(body, tigerShark);
            });
    });

    it('delete pet', () => {
        return request.delete(`/pets/${tigerShark._id}`)
            .then(() => {
                return Pet.findById(tigerShark._id);
            })
            .then(found => {
                assert.isUndefined(found);
            });
    });

    it('update a pet', () => {
        rhino.size = 'huge';

        return request.put(`/pets/${rhino._id}`)
            .send(rhino)
            .then(({ body }) => {
                assert.deepEqual(body, rhino);
                return Pet.findById(rhino._id);
            })
            .then(updated => {
                assert.deepEqual(updated, rhino);
            });
    });

    it('404 for wrong id', () => {
        return request.get('/pets/asd')
            .then(response => {
                assert.equal(response.status, 404);
                assert.match(response.body.error, /^Pet id/);
            });
    });
});