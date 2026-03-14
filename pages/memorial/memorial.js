Page({
  data: {
    petName: '',
    birthDate: '',
    deathDate: '',
    message: '',
    imageUrl: ''
  },
  bindNameInput(e) {
    this.setData({ petName: e.detail.value });
  },
  bindBirthChange(e) {
    this.setData({ birthDate: e.detail.value });
  },
  bindDeathChange(e) {
    this.setData({ deathDate: e.detail.value });
  },
  bindMessageInput(e) {
    this.setData({ message: e.detail.value });
  },
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({ imageUrl: tempFilePaths[0] });
      }
    });
  },
  saveMemorial() {
    if (!this.data.petName || !this.data.deathDate) {
      wx.showToast({ title: '请填写必填信息', icon: 'none' });
      return;
    }
    // 模拟保存纪念空间
    wx.showLoading({ title: '保存中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '纪念空间创建成功', icon: 'success' });
      wx.navigateBack();
    }, 1500);
  }
})