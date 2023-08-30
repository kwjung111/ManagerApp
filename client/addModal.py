# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'addModal.ui'
##
## Created by: Qt User Interface Compiler version 6.5.2
##
## WARNING! All changes made in this file will be lost when recompiling UI file!
################################################################################

from PySide6.QtCore import (QCoreApplication, QDate, QDateTime, QLocale, Signal,
    QMetaObject, QObject, QPoint, QRect,
    QSize, QTime, QUrl, Qt)
from PySide6.QtGui import (QBrush, QColor, QConicalGradient, QCursor,
    QFont, QFontDatabase, QGradient, QIcon,
    QImage, QKeySequence, QLinearGradient, QPainter,
    QPalette, QPixmap, QRadialGradient, QTransform)
from PySide6.QtWidgets import (QApplication, QLabel, QLineEdit, QPushButton,QMessageBox,
    QRadioButton, QSizePolicy, QWidget)


class Ui_AddModal(object):

    def setupUi(self, Form):
        if not Form.objectName():
            Form.setObjectName(u"Form")
        Form.resize(515, 167)
        self.byteLbl = QLabel(Form)
        self.byteLbl.setObjectName(u"byteLbl")
        self.byteLbl.setGeometry(QRect(440, 50, 61, 16))
        self.label = QLabel(Form)
        self.label.setObjectName(u"label")
        self.label.setGeometry(QRect(10, 20, 50, 16))
        self.label_2 = QLabel(Form)
        self.label_2.setObjectName(u"label_2")
        self.label_2.setGeometry(QRect(10, 50, 50, 16))
        self.label_3 = QLabel(Form)
        self.label_3.setObjectName(u"label_3")
        self.label_3.setGeometry(QRect(10, 80, 50, 16))
        self.radioButton = QRadioButton(Form)
        self.radioButton.setObjectName(u"radioButton")
        self.radioButton.setGeometry(QRect(100, 20, 91, 20))
        self.radioButton_2 = QRadioButton(Form)
        self.radioButton_2.setObjectName(u"radioButton_2")
        self.radioButton_2.setGeometry(QRect(160, 20, 91, 20))
        self.ctntsTxt = QLineEdit(Form)
        self.ctntsTxt.setObjectName(u"ctntsTxt")
        self.ctntsTxt.setGeometry(QRect(100, 50, 321, 21))
        self.ctntsTxt.setMaxLength(50)
        self.wrtrTxt = QLineEdit(Form)
        self.wrtrTxt.setObjectName(u"wrtrTxt")
        self.wrtrTxt.setGeometry(QRect(100, 80, 61, 20))
        self.wrtrTxt.setMaxLength(5)
        self.addBtn = QPushButton(Form)
        self.addBtn.setObjectName(u"addBtn")
        self.addBtn.setGeometry(QRect(100, 110, 111, 41))
        self.clsBtn = QPushButton(Form)
        self.clsBtn.setObjectName(u"clsBtn")
        self.clsBtn.setGeometry(QRect(230, 110, 101, 41))

        self.retranslateUi(Form)

        QMetaObject.connectSlotsByName(Form)
        
    # setupUi

    def retranslateUi(self, Form):
        Form.setWindowTitle(QCoreApplication.translate("Form", u"Form", None))
        self.byteLbl.setText(QCoreApplication.translate("Form", u"0/100 Byte", None))
        self.label.setText(QCoreApplication.translate("Form", u"\uae34\uae09\uc5ec\ubd80", None))
        self.label_2.setText(QCoreApplication.translate("Form", u"SR \ub0b4\uc6a9", None))
        self.label_3.setText(QCoreApplication.translate("Form", u"\uc791\uc131\uc790", None))
        self.radioButton.setText(QCoreApplication.translate("Form", u"\uc77c\ubc18", None))
        self.radioButton_2.setText(QCoreApplication.translate("Form", u"\uae34\uae09", None))
        self.addBtn.setText(QCoreApplication.translate("Form", u"\ub4f1\ub85d\ud558\uae30", None))
        self.clsBtn.setText(QCoreApplication.translate("Form", u"\ub2eb\uae30", None))
    # retranslateUi
    
