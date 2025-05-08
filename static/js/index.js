const Model = {
  async upload(formData) {
    try {
      const res = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        throw new Error(`上傳失敗: ${res.status} ${res.statusText}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('上傳過程中發生錯誤:', error);
      throw error;
    }
  },
  
  async getUploadedData() {
    try {
      const res = await fetch('/upload', {
        method: 'GET'
      });
      
      if (!res.ok) {
        throw new Error(`獲取數據失敗: ${res.status} ${res.statusText}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('獲取數據過程中發生錯誤:', error);
      throw error;
    }
  }
}

const View = {
  element: {
    button: document.querySelector(".upload-button"),
    dataContainer: document.querySelector("#data-container"),
    fileInput: document.querySelector("#file-input"),
    fileName: document.querySelector("#file-name")
  },
  
  updateFileName() {
    const fileInput = this.element.fileInput;
    const fileNameDisplay = this.element.fileName;
    
    if (fileInput && fileNameDisplay) {
      fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
          fileNameDisplay.textContent = this.files[0].name;
          fileNameDisplay.classList.remove('no-file-selected');
        } else {
          fileNameDisplay.textContent = '未選擇任何檔案';
          fileNameDisplay.classList.add('no-file-selected');
        }
      });
    }
  },
  
  renderData(data) {
    if (!this.element.dataContainer) return;
    
    // 清空容器
    this.element.dataContainer.innerHTML = '';
    
    if (!data || !data.length) {
      this.element.dataContainer.innerHTML = '<p>目前沒有數據</p>';
      return;
    }
    
    // 創建數據顯示元素
    data.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'image-item';
      
      // 創建圖片容器
      const imgContainer = document.createElement('div');
      imgContainer.className = 'image-container';
      
      // 創建圖片元素
      const img = document.createElement('img');
      img.src = item.file_url;
      img.alt = '上傳的圖片';
      
      // 創建文字元素
      const textElement = document.createElement('div');
      textElement.textContent = item.text;
      textElement.className = 'image-text';
      
      // 添加到容器中
      imgContainer.appendChild(img);
      itemElement.appendChild(imgContainer);
      itemElement.appendChild(textElement);
      this.element.dataContainer.appendChild(itemElement);
    });
  }
}

const Controller = {
  init() {
    // 初始化檔案名稱顯示
    View.updateFileName();
    
    // 監聽表單提交事件
    const form = document.querySelector('#upload-form');
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }
    
    // 頁面加載時獲取數據
    this.loadData();
  },
  
  async handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // 檢查文件大小
    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (file.size > 1 * 1024 * 1024) { // 1MB
        alert("檔案大小不能超過1MB");
        return;
      }
    }
    
    try {
      const result = await Model.upload(formData);
      if (result.ok) {
        alert("上傳成功");
        await this.loadData();
        form.reset();
        View.element.fileName.textContent = '未選擇任何檔案';
        View.element.fileName.classList.add('no-file-selected');
      }
    } catch (error) {
      alert(`上傳失敗: ${error.message}`);
    }
  },
  
  async loadData() {
    try {
      const result = await Model.getUploadedData();
      if (result && result.data) {
        View.renderData(result.data);
      }
    } catch (error) {
      console.error('加載數據失敗:', error);
      alert(`加載數據失敗: ${error.message}`);
    }
  }
}

// 初始化應用程式
Controller.init();