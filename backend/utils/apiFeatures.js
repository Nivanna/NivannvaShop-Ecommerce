class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {}

        this.query = this.query.find({ ...keyword });

        return this;
    }
    filter(){
        const queryCopy = { ...this.queryStr };

        //removing feild from the query
        const removingFeild = ['keyword', 'limit', 'page'];
        removingFeild.forEach(el => delete queryCopy[el]);


        // Advance filter for price, ratings etc
        let queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)


        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    pagination(resultPerpage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerpage * ( currentPage - 1 );
        this.query = this.query.limit(resultPerpage).skip(skip);
        return this;
    }
    
}

module.exports =  APIFeatures;