import React, { useState, useRef } from 'react';
import { Upload, X, Eye, Save, Send, AlertCircle, BookOpen, User, DollarSign, MessageSquare, Search, Plus, History, ShoppingCart, Clock, Edit, Trash2, Check } from 'lucide-react';

const GunmaTextbookApp = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState({
    category: '',
    condition: '',
    maxPrice: ''
  });
  
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [contractedProducts, setContractedProducts] = useState(new Set());
  const [purchaseDetails, setPurchaseDetails] = useState({
    location: '',
    date: '',
    hour: 7,
    minute: 0
  });

  const [messages, setMessages] = useState([]);

  const [formData, setFormData] = useState({
    bookTitle: '',
    lectureName: '',
    professorName: '',
    category: '',
    condition: '',
    price: '',
    comment: '',
    images: [],
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    studentId: ''
  });
  const [authErrors, setAuthErrors] = useState({});

  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [users, setUsers] = useState([
    {
      id: 1,
      email: 'tanaka@gunma-u.ac.jp',
      password: 'password123',
      name: '田中太郎',
      studentId: 'J2300000'
    }
  ]);

  const [products, setProducts] = useState([]);

  const handleAuthInputChange = (field, value) => {
    setAuthFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (authErrors[field]) {
      setAuthErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateAuthForm = () => {
    const newErrors = {};
    
    if (!authFormData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!authFormData.email.includes('@gunma-u.ac.jp')) {
      newErrors.email = '群馬大学のメールアドレスを入力してください (@gunma-u.ac.jp)';
    }
    
    if (!authFormData.password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (authFormData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    if (authMode === 'register') {
      if (!authFormData.name.trim()) {
        newErrors.name = '氏名を入力してください';
      }
      if (!authFormData.studentId.trim()) {
        newErrors.studentId = '学籍番号を入力してください';
      }
      if (authFormData.password !== authFormData.confirmPassword) {
        newErrors.confirmPassword = 'パスワードが一致しません';
      }
      
      const existingUser = users.find(u => u.email === authFormData.email);
      if (existingUser) {
        newErrors.email = 'このメールアドレスは既に登録されています';
      }
    }
    
    setAuthErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = () => {
    if (!validateAuthForm()) return;

    if (authMode === 'login') {
      const user = users.find(u => 
        u.email === authFormData.email && u.password === authFormData.password
      );
      
      if (user) {
        setIsLoggedIn(true);
        setUser(user);
        alert('ログインしました！');
      } else {
        setAuthErrors({ email: 'メールアドレスまたはパスワードが正しくありません' });
      }
    } else {
      const newUser = {
        id: users.length + 1,
        email: authFormData.email,
        password: authFormData.password,
        name: authFormData.name,
        studentId: authFormData.studentId
      };
      
      setUsers(prev => [...prev, newUser]);
      setIsLoggedIn(true);
      setUser(newUser);
      alert('アカウントを作成し、ログインしました！');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setEditingProduct(null);
    setAuthFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      studentId: ''
    });
    setAuthErrors({});
  };

  const getFilteredProducts = () => {
    let filtered = products.filter(product => {
      if (product.status !== 'active') return false;
      
      const matchesSearch = searchQuery === '' || 
        product.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.lectureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.professorName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = filterBy.category === '' || product.category === filterBy.category;
      const matchesCondition = filterBy.condition === '' || product.condition === filterBy.condition;
      const matchesPrice = filterBy.maxPrice === '' || parseInt(product.price || '0') <= parseInt(filterBy.maxPrice);

      return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
    });

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseInt(a.price || '0') - parseInt(b.price || '0'));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseInt(b.price || '0') - parseInt(a.price || '0'));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }

    return filtered;
  };

  const getUserProducts = () => {
    if (!user) return [];
    return products.filter(product => product.sellerId === user.id && product.status !== 'deleted');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type === 'image/jpeg' || file.type === 'image/png';
      const isValidSize = file.size <= 5 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    validFiles.forEach(file => {
      if (formData.images.length < 3) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, {
              file,
              url: e.target.result,
              id: Date.now() + Math.random()
            }].slice(0, 3)
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.bookTitle.trim()) newErrors.bookTitle = '教科書名を入力してください';
    if (!formData.lectureName.trim()) newErrors.lectureName = '講義名を入力してください';
    if (!formData.professorName.trim()) newErrors.professorName = '教授名を入力してください';
    if (!formData.category) newErrors.category = '区分を選択してください';
    if (!formData.condition) newErrors.condition = '状態を選択してください';
    if (formData.price === '') newErrors.price = '希望価格を入力してください';
    if (formData.images.length === 0) newErrors.images = '画像を最低1枚アップロードしてください';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const productData = {
        bookTitle: formData.bookTitle,
        lectureName: formData.lectureName,
        professorName: formData.professorName,
        category: formData.category,
        condition: formData.condition,
        price: formData.price,
        comment: formData.comment,
        images: formData.images.map(img => img.url),
        seller: user.name,
        sellerId: user.id,
        status: 'active'
      };

      if (editingProduct) {
        setProducts(prev => prev.map(product => 
          product.id === editingProduct.id 
            ? { ...product, ...productData }
            : product
        ));
        setEditingProduct(null);
        alert('商品情報を更新しました！');
      } else {
        const newProduct = {
          id: Date.now(),
          ...productData,
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        setProducts(prev => [newProduct, ...prev]);
        alert('教科書を出品しました！');
        setActiveTab('search');
      }
      
      setFormData({
        bookTitle: '',
        lectureName: '',
        professorName: '',
        category: '',
        condition: '',
        price: '',
        comment: '',
        images: []
      });
    }
  };

  const handleDraft = () => {
    alert('下書きを保存しました！');
  };

  const isFormValid = () => {
    return formData.bookTitle && 
           formData.lectureName && 
           formData.professorName && 
           formData.category && 
           formData.condition && 
           formData.price !== '' && 
           formData.images.length > 0;
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handlePurchase = (product) => {
    setShowPurchaseForm(true);
    setPurchaseDetails({ location: '', date: '', hour: 7, minute: 0 });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      bookTitle: product.bookTitle,
      lectureName: product.lectureName,
      professorName: product.professorName,
      category: product.category,
      condition: product.condition,
      price: product.price,
      comment: product.comment,
      images: product.images.map((url, index) => ({ id: Date.now() + index, url }))
    });
    setActiveTab('sell');
  };

  const handleDeleteProduct = (productId) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: 'deleted' }
        : product
    ));
    setShowDeleteConfirm(null);
    alert('商品を削除しました');
  };

  const handleMarkAsSold = (productId) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: 'sold' }
        : product
    ));
    alert('販売完了としてマークしました');
  };

  const handleReactivate = (productId) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, status: 'active' }
        : product
    ));
    alert('商品を再出品しました');
  };

  const getWeekdays = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getMonth() + 1}月${date.getDate()}日(${days[date.getDay()]})`;
  };

  const handlePurchaseSubmit = () => {
    if (purchaseDetails.location && purchaseDetails.date && purchaseDetails.hour && purchaseDetails.minute !== undefined) {
      // 出品者にメッセージを送信
      const newMessage = {
        id: Date.now(),
        type: 'purchase_request',
        productId: selectedProduct.id,
        productTitle: selectedProduct.bookTitle,
        buyerId: user.id,
        buyerName: user.name,
        sellerId: selectedProduct.sellerId,
        sellerName: selectedProduct.seller,
        timestamp: new Date(),
        location: purchaseDetails.location,
        date: purchaseDetails.date,
        time: `${purchaseDetails.hour}:${purchaseDetails.minute.toString().padStart(2, '0')}`,
        status: 'pending' // pending, approved, rejected
      };
      
      setMessages(prev => [...prev, newMessage]);
      setContractedProducts(prev => new Set([...prev, selectedProduct.id]));
      setShowPurchaseForm(false);
      setSelectedProduct(null);
      setPurchaseDetails({ location: '', date: '', hour: 7, minute: 0 });
      alert('購入希望を送信しました！');
    }
  };

  const handleApproveRequest = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: 'approved' }
        : msg
    ));
    alert('購入希望を承認しました！');
  };

  const handleRejectRequest = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: 'rejected' }
        : msg
    ));
    
    // 契約済み商品から削除
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setContractedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(message.productId);
        return newSet;
      });
    }
    
    alert('購入希望を拒否しました');
  };

  const getUserMessages = () => {
    if (!user) return [];
    return messages.filter(msg => 
      msg.sellerId === user.id || msg.buyerId === user.id
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">出品中</span>;
      case 'sold':
        return <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">販売完了</span>;
      case 'deleted':
        return <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">削除済み</span>;
      default:
        return null;
    }
  };

  // ログインしていない場合はログイン画面を表示
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <BookOpen className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">群大わくわく教材フリマ風アプリ</h1>
            <h2 className="text-xl text-gray-600">群フリ</h2>
          </div>

          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMode === 'login' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ログイン
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMode === 'register' 
                    ? 'bg-white text-gray-900 shadow' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                新規登録
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={authFormData.email}
                onChange={(e) => handleAuthInputChange('email', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  authErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="example@gunma-u.ac.jp"
              />
              {authErrors.email && <p className="mt-1 text-sm text-red-600">{authErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={authFormData.password}
                onChange={(e) => handleAuthInputChange('password', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  authErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {authErrors.password && <p className="mt-1 text-sm text-red-600">{authErrors.password}</p>}
            </div>

            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード確認
                  </label>
                  <input
                    type="password"
                    value={authFormData.confirmPassword}
                    onChange={(e) => handleAuthInputChange('confirmPassword', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      authErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {authErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{authErrors.confirmPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    氏名
                  </label>
                  <input
                    type="text"
                    value={authFormData.name}
                    onChange={(e) => handleAuthInputChange('name', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      authErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="田中太郎"
                  />
                  {authErrors.name && <p className="mt-1 text-sm text-red-600">{authErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    学籍番号
                  </label>
                  <input
                    type="text"
                    value={authFormData.studentId}
                    onChange={(e) => handleAuthInputChange('studentId', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      authErrors.studentId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="J2300000"
                  />
                  {authErrors.studentId && <p className="mt-1 text-sm text-red-600">{authErrors.studentId}</p>}
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleAuthSubmit}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {authMode === 'login' ? 'ログイン' : '新規登録'}
          </button>

          {authMode === 'login' && (
            <div className="mt-4 text-center text-sm text-gray-600">
              テスト用アカウント: tanaka@gunma-u.ac.jp / password123
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedProduct) {
    if (showPurchaseForm) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex items-center">
              <button
                onClick={() => setShowPurchaseForm(false)}
                className="mr-3 p-1 hover:bg-blue-700 rounded"
              >
                <X className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-bold">受け渡し詳細</h1>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-lg font-semibold mb-4">購入商品</h2>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-800">{selectedProduct.bookTitle}</h3>
                <p className="text-2xl font-bold text-green-600">
                  {selectedProduct.price === '0' ? '譲渡' : `¥${selectedProduct.price}`}
                </p>
                <p className="text-gray-600 text-sm">出品者: {selectedProduct.seller}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-4">
              <h3 className="font-semibold text-gray-800 mb-4">受け渡し場所</h3>
              <div className="grid grid-cols-1 gap-2">
                {['食堂前', '図書館前', '4号館前'].map((location) => (
                  <label key={location} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="location"
                      value={location}
                      checked={purchaseDetails.location === location}
                      onChange={(e) => setPurchaseDetails({...purchaseDetails, location: e.target.value})}
                      className="mr-3 text-blue-600"
                    />
                    <span className="text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-4">
              <h3 className="font-semibold text-gray-800 mb-4">受け渡し日</h3>
              <select
                value={purchaseDetails.date}
                onChange={(e) => setPurchaseDetails({...purchaseDetails, date: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">日にちを選択してください</option>
                {getWeekdays().map((date) => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">受け渡し時間</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">時間</label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 w-12">7時</span>
                    <input
                      type="range"
                      min="7"
                      max="18"
                      value={purchaseDetails.hour}
                      onChange={(e) => setPurchaseDetails({...purchaseDetails, hour: parseInt(e.target.value)})}
                      className="flex-1 h-2 bg-gray-200 rounded-lg"
                    />
                    <span className="text-sm text-gray-600 w-12">18時</span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-lg font-semibold text-blue-600">{purchaseDetails.hour}時</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分</label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 w-12">0分</span>
                    <input
                      type="range"
                      min="0"
                      max="55"
                      step="5"
                      value={purchaseDetails.minute}
                      onChange={(e) => setPurchaseDetails({...purchaseDetails, minute: parseInt(e.target.value)})}
                      className="flex-1 h-2 bg-gray-200 rounded-lg"
                    />
                    <span className="text-sm text-gray-600 w-12">55分</span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-lg font-semibold text-blue-600">{purchaseDetails.minute}分</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handlePurchaseSubmit}
              disabled={!purchaseDetails.location || !purchaseDetails.date}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <Send className="h-5 w-5 mr-2" />
              購入希望を送信
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">商品詳細</h1>
              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                一覧に戻る
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img
                  src={selectedProduct.images[0]}
                  alt="教科書"
                  className="w-full h-64 object-cover rounded-lg shadow-md mb-4"
                />
                <div className="flex gap-2">
                  {selectedProduct.images.slice(1).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt="教科書"
                      className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75"
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedProduct.bookTitle}</h2>
                {contractedProducts.has(selectedProduct.id) && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm inline-block mb-4">
                    契約済み
                  </div>
                )}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">講義: {selectedProduct.lectureName}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">教授: {selectedProduct.professorName}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-3xl font-bold text-green-600">
                      {selectedProduct.price === '0' ? '譲渡' : `${selectedProduct.price}円`}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div>
                    <span className="text-gray-500">区分:</span>
                    <p className="font-medium">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">状態:</span>
                    <p className="font-medium">{selectedProduct.condition}</p>
                  </div>
                </div>
                
                {selectedProduct.comment && (
                  <div className="mb-6">
                    <span className="text-gray-500">出品者コメント:</span>
                    <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg">{selectedProduct.comment}</p>
                  </div>
                )}

                <div className="mb-6">
                  <span className="text-gray-500">出品者:</span>
                  <p className="font-medium">{selectedProduct.seller}</p>
                </div>
                
                {!contractedProducts.has(selectedProduct.id) && selectedProduct.status === 'active' && (
                  <button
                    onClick={() => handlePurchase(selectedProduct)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {selectedProduct.price === '0' ? '譲渡希望を送る' : '購入希望を送る'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">群大わくわく教材フリマ風アプリ</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">こんにちは、{user.name}さん</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'search', name: '検索', icon: Search },
              { id: 'sell', name: '出品', icon: Plus },
              { id: 'messages', name: 'メッセージ', icon: MessageSquare, hasNotification: getUserMessages().some(msg => msg.sellerId === user.id && msg.status === 'pending') },
              { id: 'history', name: '出品履歴', icon: History }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-2" />
                  {tab.name}
                  {tab.hasNotification && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'search' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="教科書名、講義名、教授名で検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">新着順</option>
                    <option value="oldest">古い順</option>
                    <option value="price-low">価格安い順</option>
                    <option value="price-high">価格高い順</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <select
                    value={filterBy.category}
                    onChange={(e) => setFilterBy({...filterBy, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">区分</option>
                    <option value="専門科目">専門科目</option>
                    <option value="教養科目">教養科目</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filterBy.condition}
                    onChange={(e) => setFilterBy({...filterBy, condition: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">状態</option>
                    <option value="書き込みなし">書き込みなし</option>
                    <option value="少しあり">少しあり</option>
                    <option value="結構あり">結構あり</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="最高価格"
                    value={filterBy.maxPrice}
                    onChange={(e) => setFilterBy({...filterBy, maxPrice: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {getFilteredProducts().map(product => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <img
                    src={product.images[0]}
                    alt={product.bookTitle}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.bookTitle}</h3>
                    <p className="text-sm text-gray-600 mb-1">{product.lectureName}</p>
                    <p className="text-sm text-gray-500 mb-2">{product.professorName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {product.price === '0' ? '譲渡' : `¥${product.price}`}
                      </span>
                      {contractedProducts.has(product.id) && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                          契約済み
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>状態: {product.condition}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {getFilteredProducts().length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">商品が見つかりません</h3>
                <p className="mt-1 text-sm text-gray-500">検索条件を変更するか、新しい商品を出品してください。</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sell' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingProduct ? '商品情報を編集' : '教科書を出品する'}
                </h2>
                {editingProduct && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setFormData({
                        bookTitle: '',
                        lectureName: '',
                        professorName: '',
                        category: '',
                        condition: '',
                        price: '',
                        comment: '',
                        images: [],
                        agreeToTerms: false
                      });
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    編集をキャンセル
                  </button>
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    教科書名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bookTitle}
                    onChange={(e) => handleInputChange('bookTitle', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.bookTitle ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例: プログラミング入門"
                  />
                  {errors.bookTitle && <p className="mt-1 text-sm text-red-600">{errors.bookTitle}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    講義名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lectureName}
                    onChange={(e) => handleInputChange('lectureName', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lectureName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例: プログラミング基礎"
                  />
                  {errors.lectureName && <p className="mt-1 text-sm text-red-600">{errors.lectureName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    教授名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.professorName}
                    onChange={(e) => handleInputChange('professorName', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.professorName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例: 田中 太郎"
                  />
                  {errors.professorName && <p className="mt-1 text-sm text-red-600">{errors.professorName}</p>}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      区分 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">選択してください</option>
                      <option value="専門科目">専門科目</option>
                      <option value="教養科目">教養科目</option>
                    </select>
                    {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      状態 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.condition ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">選択してください</option>
                      <option value="書き込みなし">書き込みなし</option>
                      <option value="少しあり">少しあり</option>
                      <option value="結構あり">結構あり</option>
                    </select>
                    {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      希望価格 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0 (譲渡の場合は0)"
                      min="0"
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    画像 <span className="text-red-500">*</span> (最大3枚)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          画像を選択
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        JPEG、PNG形式、5MB以下
                      </p>
                    </div>
                  </div>
                  
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {formData.images.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.url}
                            alt="アップロード画像"
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    コメント（任意）
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => handleInputChange('comment', e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="受け渡し場所や状態についての詳細など..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleDraft}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    下書き保存
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isFormValid()}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    {editingProduct ? '更新する' : '出品する'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">メッセージ</h2>
            {getUserMessages().length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">メッセージはありません</h3>
                <p className="mt-1 text-sm text-gray-500">購入希望者とのやり取りがここに表示されます。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getUserMessages().map(message => (
                  <div key={message.id} className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          message.status === 'pending' ? 'bg-yellow-500' :
                          message.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {message.type === 'purchase_request' ? '購入希望' : message.type}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          message.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          message.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {message.status === 'pending' ? '承認待ち' :
                           message.status === 'approved' ? '承認済み' : '拒否済み'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(message.timestamp).toLocaleString('ja-JP')}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">商品情報</h4>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">商品名:</span> {message.productTitle}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">
                            {message.sellerId === user.id ? '購入希望者' : '出品者'}:
                          </span> {message.sellerId === user.id ? message.buyerName : message.sellerName}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">受け渡し詳細</h4>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">場所:</span> {message.location}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">日時:</span> {formatDate(message.date)} {message.time}
                        </p>
                      </div>
                    </div>

                    {message.sellerId === user.id && message.status === 'pending' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <button
                          onClick={() => handleApproveRequest(message.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          承認する
                        </button>
                        <button
                          onClick={() => handleRejectRequest(message.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <X className="w-4 h-4 mr-2" />
                          拒否する
                        </button>
                      </div>
                    )}

                    {message.status === 'approved' && (
                      <div className="mt-4 pt-4 border-t bg-green-50 -m-6 mt-4 p-4 rounded-b-lg">
                        <p className="text-green-800 font-medium text-sm">
                          購入が承認されました！指定の日時・場所で受け渡しを行ってください。
                        </p>
                      </div>
                    )}

                    {message.status === 'rejected' && (
                      <div className="mt-4 pt-4 border-t bg-red-50 -m-6 mt-4 p-4 rounded-b-lg">
                        <p className="text-red-800 font-medium text-sm">
                          購入希望は拒否されました。
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">出品履歴</h2>
            {getUserProducts().length === 0 ? (
              <div className="text-center py-12">
                <History className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">出品履歴はありません</h3>
                <p className="mt-1 text-sm text-gray-500">出品した教科書がここに表示されます。</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {getUserProducts().map(product => (
                  <div key={product.id} className="bg-gray-50 rounded-lg p-6 border">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4 flex-1">
                        <img
                          src={product.images[0]}
                          alt={product.bookTitle}
                          className="w-20 h-24 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{product.bookTitle}</h3>
                            {getStatusBadge(product.status)}
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600 mb-3">
                            <p><span className="font-medium">講義:</span> {product.lectureName}</p>
                            <p><span className="font-medium">教授:</span> {product.professorName}</p>
                            <p><span className="font-medium">状態:</span> {product.condition}</p>
                            <p><span className="font-medium">出品日:</span> {formatDate(product.createdAt)}</p>
                          </div>
                          
                          <div className="text-2xl font-bold text-green-600 mb-3">
                            {product.price === '0' ? '譲渡' : `¥${product.price}`}
                          </div>
                          
                          {product.comment && (
                            <div className="bg-white p-3 rounded border text-sm text-gray-700">
                              <span className="font-medium">コメント:</span> {product.comment}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {product.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              編集
                            </button>
                            <button
                              onClick={() => handleMarkAsSold(product.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors flex items-center"
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              販売完了
                            </button>
                          </>
                        )}
                        
                        {product.status === 'sold' && (
                          <button
                            onClick={() => handleReactivate(product.id)}
                            className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors flex items-center"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            再出品
                          </button>
                        )}
                        
                        <button
                          onClick={() => setShowDeleteConfirm(product.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">商品を削除しますか？</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              この操作は取り消すことができません。本当に削除してもよろしいですか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDeleteProduct(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GunmaTextbookApp;
