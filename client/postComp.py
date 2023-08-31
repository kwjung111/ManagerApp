import sys
from PySide6.QtWidgets import QApplication, QWidget, QVBoxLayout, QPushButton

class postComponent(QWidget):
    def __init__(self, button_labels, parent=None):
        super(postComponent, self).__init__(parent)
        
        # Layout 설정
        layout = QVBoxLayout(self)
        
        # 동적으로 QPushButton 생성
        for label in button_labels:
            btn = QPushButton(label)
            btn.clicked.connect(self.on_button_clicked)
            layout.addWidget(btn)
        
        self.setLayout(layout)
    
    def on_button_clicked(self):
        sender = self.sender()
        print(f"'{sender.text()}' 버튼이 클릭되었습니다.")