from PySide6.QtWidgets import *
import threading 
from PySide6.QtCore import QThread
from layout import Ui_MainWindow
from addModal import Ui_AddModal
from memoModal import Ui_MemoModal
import time
import rel      #registered event listener. 
import requests
import json
import websocket
from url import Urls


class MainWindow(QMainWindow,Ui_MainWindow):
    
    def __init__(self, *args, obj=None, **kwargs):
        super(MainWindow, self).__init__(*args, **kwargs)
        
        self.setupUi(self)
        self.addBtn.clicked.connect(self.add_event)
        
        wst = websocketThread(self.refresh)
        wst.start() 
        
        self.refresh()
        
        
            
    # 게시물 추가 팝업 생성
    def add_event(self):
        dialog = AddModalDialog()
        dialog.exec_()
    
   

    # 게시물 카운트 조회
    def getPostsCount(self):
        return self.returnResponse(Urls.postsCountUrl)
    
    #TODO  게시물 카운트 렌더링
    def renderPostsCount(self):
        data = self.getPostsCount()
        print(data['recentPost'])
        print(data['acting'])
        print(data['emergency'])
    
    # 게시물 조회
    def getPosts(self):
        return self.returnResponse(Urls.getPostsUrl)
    
    #TODO 게시물 렌더링        
    def renderPosts(self):
        data = self.getPosts()
    
    def getMemos(self):
        return self.returnResponse(Urls.getMemosUrl)
            
    #TODO 메모 렌더링
    def renderMemos(self):
        data = self.getMemos()
        print(data)
        return 
            
    def refresh(self):
        print('refreshed!')
        self.renderPostsCount()
        self.renderPosts()
        self.renderMemos()
        #TODO 어떻게 게시물-메모 렌더링 할것인지?
    
    def returnResponse(slef,url):
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        else:
            #Todo 경고모달
            print('no connection')
            return 'error'
        
#게시물 추가 팝업
class AddModalDialog(QDialog, Ui_AddModal):
    def __init__(self):
        super(AddModalDialog, self).__init__()
        self.setupUi(self)
        self.addBtn.clicked.connect(self.addBtn_event)
        self.clsBtn.clicked.connect(self.close)
        
    def addBtn_event(self):
        if(self.ctntsTxt.text() == ""):
            QMessageBox.warning(self,'체크해 주세요','내용을 입력해주세요')
            return
        if(self.wrtrTxt.text() == ""):
            QMessageBox.warning(self,'체크해 주세요','작성자를 입력해주세요')
            return
        
        addData = {
            'content' : self.ctntsTxt.text(),
            'writer' : self.wrtrTxt.text(),
        }
        
        response = requests.post( Urls.addUrl , json=addData)
        
        if response.status_code==200 :
            print(response.text)
            self.close()
        
#메모 추가 팝업
class AddMemoModalDialog(QDialog, Ui_MemoModal):
    def __init__(self):
        super(AddModalDialog, self).__init__()
        self.setupUi(self)
        self.addBtn.clicked.connect(self.addBtn_event)
        self.clsBtn.clicked.connect(self.close)
        
    def addBtn_event(self):
        if(self.ctntsTxt.text() == ""):
            QMessageBox.warning(self,'체크해 주세요','내용을 입력해주세요')
            return
        if(self.wrtrTxt.text() == ""):
            QMessageBox.warning(self,'체크해 주세요','작성자를 입력해주세요')
            return
        
        addData = {
            'content' : self.ctntsTxt.text(),
            'writer' : self.wrtrTxt.text(),
        }
        
        response = requests.post(Urls.addMemoUrl, json=addData)
        
        if response.status_code==200 :
            print(response.text)
            self.close()

class websocketThread(QThread):
      #웹소켓 연결
    def __init__(self,refreshCallback):
        super().__init__()
        self.refreshCallback = refreshCallback
        self.daemon = True #프로그램 종료시 스레드 자동 종료
                
    def on_message(self,ws, msg):
        if msg != "connected":
            self.refreshCallback()
        print(msg)

    def on_error(self,ws, error):
        print(f"Error: {error}")
        #TODO 에러 모달 추가예정

    def on_close(self,ws, close_status_code, close_msg):
        print("종료")

    def on_open(self,ws):
        print("웹소켓 연결됨")
        
    def run(self):
        websocket.enableTrace(True)
        self.ws = websocket.WebSocketApp(Urls.wsConnectUrl,
            on_message=self.on_message,
            on_error=lambda ws, error: self.on_error(ws,error),
            on_close=lambda ws, close_status_code, close_msg: self.on_close(ws,close_status_code, close_msg),
            on_open =lambda ws: self.on_open(ws))
        
        self.ws.run_forever(reconnect=5)  # 연결 종료시 5초마다 서버 재접속 

        
        
app = QApplication()
window = MainWindow()
window.show()
app.exec()

