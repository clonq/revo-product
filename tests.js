var should = require('chai').should();

var Product = require('./component');
var product;

before(function(){
    product = new Product();
    product.init({persistence: 'file', storage: 'products.json'});
});

describe('smoke tests', function(){
    it('should load existing products from file', function(done){
        process.once('product:find.error', function(err){
            done(err);
        });
        process.once('product:find.response', function(result){
            result.should.not.have.property('error');
            result.length.should.equal(1);
            done();            
        });
        process.emit('product:find', {});
    });
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
        process.emit('product:clear', {});
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
        process.emit('product:clear', {});
        process.emit('product:create', {name:'test'});
    });
    it('should create valid products', function(done){
        process.once('product:create.error', function(err){
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
        process.once('product:clear.error', function(err){
            done(err);
        });
        process.once('product:clear.response', function(){
            process.emit('product:create', {name:'test', SKU:'1'});
        });
        process.emit('product:clear', {});
    });
    it('should restore storage', function(done){
        process.once('product:create.response', function(result){
            done();
        });
        process.emit('product:create', {name:'test'});
    });
});
