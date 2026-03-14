Page({
  data: {
    petName: '',
    petTypeIndex: 0,
    petTypes: ['狗狗', '猫咪', '其他宠物'],
    date: '',
    serviceValue: 'cremation',
    services: [
      { name: '遗体火化', value: 'cremation' },
      { name: '骨灰寄存', value: 'ashes' },
      { name: '纪念用品', value: 'memorial' }
    ]
  },
  onLoad() {
    // 初始化默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    this.setData({ date: today });
  },
  bindNameInput(e) {
    this.setData({ petName: e.detail.value });
  },
  bindTypeChange(e) {
    this.setData({ petTypeIndex: e.detail.value });
  },
  bindDateChange(e) {
    this.setData({ date: e.detail.value });
  },
  bindServiceChange(e) {
    this.setData({ serviceValue: e.detail.value });
  },
  submitAppointment() {
    if (!this.data.petName) {
      wx.showToast({ title: '请输入宠物姓名', icon: 'none' });
      return;
    }
    // 模拟提交预约
    wx.showLoading({ title: '提交中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '预约成功', icon: 'success' });
      wx.navigateBack();
    }, 1500);
  }
})