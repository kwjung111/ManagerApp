# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'layout.ui'
##
## Created by: Qt User Interface Compiler version 6.5.2
##
## WARNING! All changes made in this file will be lost when recompiling UI file!
################################################################################

from PySide6.QtCore import (QCoreApplication, QDate, QDateTime, QLocale,
    QMetaObject, QObject, QPoint, QRect,
    QSize, QTime, QUrl, Qt)
from PySide6.QtGui import (QBrush, QColor, QConicalGradient, QCursor,
    QFont, QFontDatabase, QGradient, QIcon,
    QImage, QKeySequence, QLinearGradient, QPainter,
    QPalette, QPixmap, QRadialGradient, QTransform)
from PySide6.QtWidgets import (QApplication, QHeaderView, QLabel, QMainWindow,
    QMenuBar, QPushButton, QSizePolicy, QStatusBar,
    QTextEdit, QTreeWidget, QTreeWidgetItem, QVBoxLayout,
    QWidget)

class Ui_MainWindow(object):
    def setupUi(self, MainWindow):
        if not MainWindow.objectName():
            MainWindow.setObjectName(u"MainWindow")
        MainWindow.resize(908, 445)
        MainWindow.setAcceptDrops(False)
        MainWindow.setAutoFillBackground(False)
        self.centralwidget = QWidget(MainWindow)
        self.centralwidget.setObjectName(u"centralwidget")
        self.whatBtn = QPushButton(self.centralwidget)
        self.whatBtn.setObjectName(u"whatBtn")
        self.whatBtn.setGeometry(QRect(780, 10, 41, 41))
        self.addBtn = QPushButton(self.centralwidget)
        self.addBtn.setObjectName(u"addBtn")
        self.addBtn.setGeometry(QRect(830, 10, 41, 41))
        self.verticalLayoutWidget = QWidget(self.centralwidget)
        self.verticalLayoutWidget.setObjectName(u"verticalLayoutWidget")
        self.verticalLayoutWidget.setGeometry(QRect(20, 80, 131, 281))
        self.verticalLayout = QVBoxLayout(self.verticalLayoutWidget)
        self.verticalLayout.setObjectName(u"verticalLayout")
        self.verticalLayout.setContentsMargins(0, 0, 0, 0)
        self.onProgAlert = QTextEdit(self.verticalLayoutWidget)
        self.onProgAlert.setObjectName(u"onProgAlert")

        self.verticalLayout.addWidget(self.onProgAlert)

        self.onProg = QTextEdit(self.verticalLayoutWidget)
        self.onProg.setObjectName(u"onProg")

        self.verticalLayout.addWidget(self.onProg)

        self.recentWeek = QTextEdit(self.verticalLayoutWidget)
        self.recentWeek.setObjectName(u"recentWeek")

        self.verticalLayout.addWidget(self.recentWeek)

        self.verticalLayoutWidget_2 = QWidget(self.centralwidget)
        self.verticalLayoutWidget_2.setObjectName(u"verticalLayoutWidget_2")
        self.verticalLayoutWidget_2.setGeometry(QRect(160, 80, 651, 281))
        self.mainLayout = QVBoxLayout(self.verticalLayoutWidget_2)
        self.mainLayout.setObjectName(u"mainLayout")
        self.mainLayout.setContentsMargins(0, 0, 0, 0)
        self.treeWidget = QTreeWidget(self.verticalLayoutWidget_2)
        self.treeWidget.setObjectName(u"treeWidget")
        self.treeWidget.setColumnCount(0)

        self.mainLayout.addWidget(self.treeWidget)

        self.dateTime = QLabel(self.centralwidget)
        self.dateTime.setObjectName(u"dateTime")
        self.dateTime.setGeometry(QRect(40, 20, 691, 31))
        font = QFont()
        font.setFamilies([u"Agency FB"])
        font.setPointSize(18)
        self.dateTime.setFont(font)
        self.dateTime.setLayoutDirection(Qt.LeftToRight)
        self.dateTime.setTextFormat(Qt.RichText)
        self.dateTime.setAlignment(Qt.AlignCenter)
        MainWindow.setCentralWidget(self.centralwidget)
        self.menubar = QMenuBar(MainWindow)
        self.menubar.setObjectName(u"menubar")
        self.menubar.setGeometry(QRect(0, 0, 908, 26))
        MainWindow.setMenuBar(self.menubar)
        self.statusbar = QStatusBar(MainWindow)
        self.statusbar.setObjectName(u"statusbar")
        MainWindow.setStatusBar(self.statusbar)

        self.retranslateUi(MainWindow)

        QMetaObject.connectSlotsByName(MainWindow)
    # setupUi

    def retranslateUi(self, MainWindow):
        MainWindow.setWindowTitle(QCoreApplication.translate("MainWindow", u"SR List", None))
        self.whatBtn.setText(QCoreApplication.translate("MainWindow", u"\ubc84\ud2bc", None))
        self.addBtn.setText(QCoreApplication.translate("MainWindow", u"+", None))
        self.onProgAlert.setHtml(QCoreApplication.translate("MainWindow", u"<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:'Gulim'; font-size:9pt; font-weight:400; font-style:normal;\">\n"
"<p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-family:'\ub9d1\uc740 \uace0\ub515';\">\uae34\uae09 \ucc98\ub9ac \uc911</span></p></body></html>", None))
        self.onProg.setHtml(QCoreApplication.translate("MainWindow", u"<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:'Gulim'; font-size:9pt; font-weight:400; font-style:normal;\">\n"
"<p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-family:'\ub9d1\uc740 \uace0\ub515';\">\ucc98\ub9ac \uc911</span></p></body></html>", None))
        self.recentWeek.setHtml(QCoreApplication.translate("MainWindow", u"<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0//EN\" \"http://www.w3.org/TR/REC-html40/strict.dtd\">\n"
"<html><head><meta name=\"qrichtext\" content=\"1\" /><style type=\"text/css\">\n"
"p, li { white-space: pre-wrap; }\n"
"</style></head><body style=\" font-family:'Gulim'; font-size:9pt; font-weight:400; font-style:normal;\">\n"
"<p style=\" margin-top:0px; margin-bottom:0px; margin-left:0px; margin-right:0px; -qt-block-indent:0; text-indent:0px;\"><span style=\" font-family:'\ub9d1\uc740 \uace0\ub515';\">\ucd5c\uadfc 1\uc8fc\uc77c \uc811\uc218</span></p></body></html>", None))
        self.dateTime.setText("")
    # retranslateUi

