class Urls():
    url = 'localhost:3000'
    httpUrl = 'http://'+url
    
    wsConnectUrl = 'ws://'+url
    addUrl = httpUrl + '/add'
    removeUrl = httpUrl + '/remove'
    addMemoUrl = httpUrl + '/addMemo'
    getPostsUrl = httpUrl + '/posts'
    getMemosUrl = httpUrl + '/memos'
    postsCountUrl = httpUrl + '/postsCount'  
    
    def __init__(self):
        return