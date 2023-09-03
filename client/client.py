from PySide6.QtWidgets import *
import threading 
from PySide6.QtCore import QThread, Signal, QTimer, QDateTime
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
        
        wst = websocketThread()
        wst.signal.connect(self.refresh)
        wst.start()
        
        self.refresh()
        
        timer = QTimer(self) 
        timer.timeout.connect(self.showTime)
        timer.start(100)
    
        
        
    def showTime(self):
        curTime = QDateTime.currentDateTime()
        strTime = curTime.toString("yyyy.MM.dd hh:mm:ss")
        self.dateTime.setText(strTime)
    
                    
    # 게시물 추가 팝업 생성
    def add_event(self):
        dialog = AddModalDialog()
        dialog.exec()
    
    # 게시물 카운트 조회
    def getPostsCount(self):
        return self.returnResponse(Urls.postsCountUrl)
    
    #TODO  게시물 카운트 렌더링
    def renderPostsCount(self):
        data = self.getPostsCount()
        self.recentWeek.setText("최근 1주일 접수 : " + str(data[0]['recentPost']))
        self.onProg.setText("처리 중 : " + str(data[0]['acting']))
        self.onProgAlert.setText("긴급 처리 중  : " + str(data[0]['emergency']))
    
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
            jsonData = response.json()
            return jsonData['result']
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
        self.radioButton.setChecked(True)
        
    def addBtn_event(self):
        postCd = 1
        if(self.ctntsTxt.text() == ""):
            QMessageBox.warning(self,'체크해 주세요','내용을 입력해주세요')
            return
        if(self.wrtrTxt.text() == ""):
            QMessageBox.warning(self,'체크해 주세요','작성자를 입력해주세요')
            return
        if self.radioButton.isChecked():
            postCd = 1
        else:
            postCd = 2
        
        addData = {
            'postCd' : postCd,
            'content' : self.ctntsTxt.text(),
            'writer' : self.wrtrTxt.text(),
        }
        
        response = requests.post( Urls.addUrl , json=addData)

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
    signal = Signal(str)
      #웹소켓 연결
    def __init__(self):
        super().__init__()
        self.daemon = True #프로그램 종료시 스레드 자동 종료
                
    def on_message(self,ws, msg):
        if msg != "connected":
            self.signal.emit("refresh")
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

