var should = require('chai').should();

var Product = require('./component');
var product = new Product();
product.init();

describe('smoke tests', function(){
    it('should not create a product without a name', function(done){
        process.once('product:find.error', function(err){
            done(err);
        });
        process.once('product:create.response', function(result){
            should.exist(result);
            result.should.have.property('error');
            result.error.should.have.property('message');
            result.error.message.should.equal('requires property "name"');
            done();
        });
        process.emit('product:create', {});
    });
    it('should not create a product without a SKU', function(done){
        process.once('product:find.error', function(err){
            done(err);
        });
        process.once('product:create.response', function(result){
            should.exist(result);
            result.should.have.property('error');
            result.error.should.have.property('message');
            result.error.message.should.equal('requires property "SKU"');
            done();
        });
        process.emit('product:create', {name:'test'});
    });
    it('should create valid products', function(done){
        process.once('product:find.error', function(err){
            done(err);
        });
        process.once('product:create.response', function(result){
            should.exist(result);
            result.should.not.have.property('error');
            result.should.have.property('product');
            result.product.should.have.property('name');
            result.product.name.should.equal('test');
            done();
        });
        process.emit('product:create', {name:'test', SKU:'1'});
    });
    it('should find all products', function(done){
        process.once('product:find.error', function(err){
            done(err);
        });
        process.once('product:find.response', function(result){
            result.should.not.have.property('error');
            result.length.should.equal(4);
            done();            
        });
        process.emit('product:create', {name:'alpha', SKU:'100'});
        process.emit('product:create', {name:'beta', SKU:'200'});
        process.emit('product:create', {name:'gamma', SKU:'300'});
        process.emit('product:find', {});
    })
});
