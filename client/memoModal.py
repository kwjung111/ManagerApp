# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'replyModal.ui'
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
from PySide6.QtWidgets import (QApplication, QLabel, QLineEdit, QPushButton,
    QSizePolicy, QWidget)

class Ui_MemoModal(object):
    def setupUi(self, Form):
        if not Form.objectName():
            Form.setObjectName(u"Form")
        Form.resize(511, 121)
        self.byteLbl = QLabel(Form)
        self.byteLbl.setObjectName(u"byteLbl")
        self.byteLbl.setGeometry(QRect(440, 10, 61, 16))
        self.label_2 = QLabel(Form)
        self.label_2.setObjectName(u"label_2")
        self.label_2.setGeometry(QRect(10, 10, 50, 16))
        self.label_3 = QLabel(Form)
        self.label_3.setObjectName(u"label_3")
        self.label_3.setGeometry(QRect(10, 40, 50, 16))
        self.ctntsTxt = QLineEdit(Form)
        self.ctntsTxt.setObjectName(u"ctntsTxt")
        self.ctntsTxt.setGeometry(QRect(100, 10, 321, 21))
        self.ctntsTxt.setMaxLength(50)
        self.wrtrTxt = QLineEdit(Form)
        self.wrtrTxt.setObjectName(u"wrtrTxt")
        self.wrtrTxt.setGeometry(QRect(100, 40, 61, 20))
        self.wrtrTxt.setMaxLength(5)
        self.addBtn = QPushButton(Form)
        self.addBtn.setObjectName(u"addBtn")
        self.addBtn.setGeometry(QRect(100, 70, 111, 41))
        self.clsBtn = QPushButton(Form)
        self.clsBtn.setObjectName(u"clsBtn")
        self.clsBtn.setGeometry(QRect(230, 70, 101, 41))

        self.retranslateUi(Form)

        QMetaObject.connectSlotsByName(Form)
    # setupUi

    def retranslateUi(self, Form):
        Form.setWindowTitle(QCoreApplication.translate("Form", u"Form", None))
        self.byteLbl.setText(QCoreApplication.translate("Form", u"0/100 Byte", None))
        self.label_2.setText(QCoreApplication.translate("Form", u"\uba54\ubaa8 \ub0b4\uc6a9", None))
        self.label_3.setText(QCoreApplication.translate("Form", u"\uc791\uc131\uc790", None))
        self.addBtn.setText(QCoreApplication.translate("Form", u"\ub4f1\ub85d\ud558\uae30", None))
        self.clsBtn.setText(QCoreApplication.translate("Form", u"\ub2eb\uae30", None))
    # retranslateUi

