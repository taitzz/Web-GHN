import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import styles from '../../assets/styles/CreateOrder.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { QRCodeCanvas } from "qrcode.react";
import Swal from 'sweetalert2';

const CreateOrder = () => {
  const [formData, setFormData] = useState({
    senderProvince: '',
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    senderDistrict: '',
    senderWard: '',
    receiverProvince: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverDistrict: '',
    receiverWard: '',
    items: [
      {
        itemName: '',
        quantity: 1,
        weight: '',
        length: '',
        width: '',
        height: '',
        notes: '',
      },
    ],
    deliveryType: 'standard',
    paymentMethod: 'sender',
    totalCost: 0,
    distance: 0,
    paymentStatus: 'Pending',
    Notes: ''
  });

  const [errors, setErrors] = useState({
    senderProvince: '',
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    senderDistrict: '',
    senderWard: '',
    receiverProvince: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverDistrict: '',
    receiverWard: '',
    items: [{ itemName: '', quantity: '', weight: '', length: '', width: '', height: '' }],
  });

  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]); // Danh sách tỉnh/thành phố
  const [districts, setDistricts] = useState({ sender: [], receiver: [] }); // Danh sách quận/huyện
  const [wards, setWards] = useState({ sender: [], receiver: [] }); // Danh sách phường/xã
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [weightWarning, setWeightWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState({
    senderProvince: false,
    senderDistrict: false,
    senderWard: false,
    receiverProvince: false,
    receiverDistrict: false,
    receiverWard: false,
  });
  const [searchTerms, setSearchTerms] = useState({
    senderProvince: '',
    senderDistrict: '',
    senderWard: '',
    receiverProvince: '',
    receiverDistrict: '',
    receiverWard: '',
  });

  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/p/?depth=1');
        setProvinces(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
      }
    };
    fetchProvinces();
  }, []);

  // Lấy danh sách quận/huyện dựa trên tỉnh/thành phố
  const fetchDistricts = async (provinceCode, type) => {
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
      setDistricts((prev) => ({
        ...prev,
        [type]: response.data.districts,
      }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách quận/huyện:', error);
    }
  };

  // Lấy danh sách phường/xã dựa trên quận/huyện
  const fetchWards = async (districtCode, type) => {
    try {
      const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      setWards((prev) => ({
        ...prev,
        [type]: response.data.wards,
      }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phường/xã:', error);
    }
  };

  // Lấy tọa độ dựa trên tỉnh/thành phố, quận/huyện, phường/xã
  // Hàm chuẩn hóa tên tỉnh/thành phố
const normalizeProvinceName = (provinceName) => {
  const provinceMap = {
    'TP. Hồ Chí Minh': 'Ho Chi Minh City',
    'Hà Nội': 'Hanoi',
    'Đà Nẵng': 'Da Nang',
    'Hải Phòng': 'Hai Phong',
    'Cần Thơ': 'Can Tho',
    // Thêm các tỉnh/thành phố khác nếu cần
  };
  return provinceMap[provinceName] || provinceName.replace('TP. ', '').replace('Tỉnh ', '');
};

// Hàm lấy tọa độ của phường/xã
const fetchCoordinates = async (provinceCode, districtCode, wardCode, type) => {
  try {
    const province = provinces.find((p) => p.code === provinceCode)?.name || '';
    const district = districts[type].find((d) => d.code === districtCode)?.name || '';
    const ward = wards[type].find((w) => w.code === wardCode)?.name || '';
    
    // Chuẩn hóa tên tỉnh/thành phố
    const normalizedProvince = normalizeProvinceName(province);
    
    // Ưu tiên lấy tọa độ chỉ với phường/xã và tỉnh/thành phố
    let fullAddress = `${ward}, ${normalizedProvince}, Vietnam`;
    console.log(`Đang lấy tọa độ cho địa chỉ: ${fullAddress}`);
    
    let response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'YourAppName/1.0 (your-email@example.com)',
        },
      }
    );

    // Nếu không tìm thấy, thử định dạng đầy đủ (bao gồm quận/huyện)
    if (response.data.length === 0) {
      fullAddress = `${ward}, ${district}, ${normalizedProvince}, Vietnam`;
      console.log(`Thử lại với địa chỉ: ${fullAddress}`);
      response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your-email@example.com)',
          },
        }
      );
    }

    // Nếu vẫn không tìm thấy, thử chỉ với tỉnh/thành phố
    if (response.data.length === 0) {
      fullAddress = `${normalizedProvince}, Vietnam`;
      console.log(`Thử lại với địa chỉ: ${fullAddress}`);
      response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'YourAppName/1.0 (your-email@example.com)',
          },
        }
      );
    }

    if (response.data.length > 0) {
      const coords = {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
      };
      console.log(`Tọa độ cho ${fullAddress}:`, coords);
      return coords;
    } else {
      console.warn(`Không tìm thấy tọa độ cho địa chỉ: ${fullAddress}`);
      return null;
    }
  } catch (error) {
    console.error('Lỗi khi lấy tọa độ:', error.message);
    return null;
  }
};

  // Tính khoảng cách giữa hai điểm
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6378; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Xử lý thay đổi giá trị trong form
  const handleChange = async (e, index) => {
    const { name, value } = e.target;
    if (index !== undefined) {
      const updatedItems = [...formData.items];
      updatedItems[index] = { ...updatedItems[index], [name]: value };
      setFormData({ ...formData, items: updatedItems });
      validateField(name, value, index);
    } else {
      if (name === 'paymentMethod') {
        setIsPaymentSuccessful(false);
        setFormData({
          ...formData,
          paymentMethod: value,
          paymentStatus: value === 'sender' ? 'Pending' : 'Pending'
        });
      } else if (name === 'senderProvince') {
        setFormData({ ...formData, [name]: value, senderDistrict: '', senderWard: '' });
        fetchDistricts(value, 'sender');
        setShowDropdown((prev) => ({ ...prev, senderProvince: false }));
      } else if (name === 'receiverProvince') {
        setFormData({ ...formData, [name]: value, receiverDistrict: '', receiverWard: '' });
        fetchDistricts(value, 'receiver');
        setShowDropdown((prev) => ({ ...prev, receiverProvince: false }));
      } else if (name === 'senderDistrict') {
        setFormData({ ...formData, [name]: value, senderWard: '' });
        fetchWards(value, 'sender');
        setShowDropdown((prev) => ({ ...prev, senderDistrict: false }));
      } else if (name === 'receiverDistrict') {
        setFormData({ ...formData, [name]: value, receiverWard: '' });
        fetchWards(value, 'receiver');
        setShowDropdown((prev) => ({ ...prev, receiverDistrict: false }));
      } else if (name === 'senderWard' || name === 'receiverWard') {
        setFormData({ ...formData, [name]: value });
        setShowDropdown((prev) => ({ ...prev, [name]: false }));
      } else {
        setFormData({ ...formData, [name]: value });
      }
      validateField(name, value);
    }
  };

  // Kiểm tra từng trường
  const validateField = (name, value, index) => {
    const newErrors = { ...errors };

    if (index !== undefined) {
      const itemErrors = [...newErrors.items];
      if (!itemErrors[index]) itemErrors[index] = {};

      if (name === 'itemName') itemErrors[index].itemName = value ? '' : 'Tên hàng hóa không được để trống.';
      if (name === 'quantity') itemErrors[index].quantity = !value || isNaN(value) || parseInt(value) <= 0 ? 'Số lượng phải là số nguyên dương.' : '';
      if (name === 'weight') itemErrors[index].weight = !value || isNaN(value) || parseFloat(value) <= 0 ? 'Trọng lượng phải là số dương.' : '';
      if (name === 'length') itemErrors[index].length = !value || isNaN(value) || parseFloat(value) <= 0 ? 'Chiều dài phải là số dương.' : '';
      if (name === 'width') itemErrors[index].width = !value || isNaN(value) || parseFloat(value) <= 0 ? 'Chiều rộng phải là số dương.' : '';
      if (name === 'height') itemErrors[index].height = !value || isNaN(value) || parseFloat(value) <= 0 ? 'Chiều cao phải là số dương.' : '';
      newErrors.items = itemErrors;
    } else {
      if (name === 'senderProvince') newErrors.senderProvince = value ? '' : 'Vui lòng chọn Tỉnh/Thành phố.';
      if (name === 'senderName') newErrors.senderName = value ? '' : 'Tên người gửi không được để trống.';
      if (name === 'senderPhone') newErrors.senderPhone = /^\d{10}$/.test(value) ? '' : 'Số điện thoại phải là số và có 10 chữ số.';
      if (name === 'senderAddress') newErrors.senderAddress = value ? '' : 'Địa chỉ không được để trống.';
      if (name === 'senderDistrict') newErrors.senderDistrict = value ? '' : 'Vui lòng chọn Quận/Huyện.';
      if (name === 'senderWard') newErrors.senderWard = value ? '' : 'Vui lòng chọn Phường/Xã.';
      if (name === 'receiverProvince') newErrors.receiverProvince = value ? '' : 'Vui lòng chọn Tỉnh/Thành phố.';
      if (name === 'receiverName') newErrors.receiverName = value ? '' : 'Tên người nhận không được để trống.';
      if (name === 'receiverPhone') newErrors.receiverPhone = /^\d{10}$/.test(value) ? '' : 'Số điện thoại phải là số và có 10 chữ số.';
      if (name === 'receiverAddress') newErrors.receiverAddress = value ? '' : 'Địa chỉ không được để trống.';
      if (name === 'receiverDistrict') newErrors.receiverDistrict = value ? '' : 'Vui lòng chọn Quận/Huyện.';
      if (name === 'receiverWard') newErrors.receiverWard = value ? '' : 'Vui lòng chọn Phường/Xã.';
    }
    setErrors(newErrors);
  };

  // Kiểm tra toàn bộ form
  const validateForm = () => {
    const newErrors = { ...errors };

    newErrors.senderProvince = formData.senderProvince ? '' : 'Vui lòng chọn Tỉnh/Thành phố.';
    newErrors.senderName = formData.senderName ? '' : 'Tên người gửi không được để trống.';
    newErrors.senderPhone = /^\d{10}$/.test(formData.senderPhone) ? '' : 'Số điện thoại phải là số và có 10 chữ số.';
    newErrors.senderAddress = formData.senderAddress ? '' : 'Địa chỉ không được để trống.';
    newErrors.senderDistrict = formData.senderDistrict ? '' : 'Vui lòng chọn Quận/Huyện.';
    newErrors.senderWard = formData.senderWard ? '' : 'Vui lòng chọn Phường/Xã.';
    newErrors.receiverProvince = formData.receiverProvince ? '' : 'Vui lòng chọn Tỉnh/Thành phố.';
    newErrors.receiverName = formData.receiverName ? '' : 'Tên người nhận không được để trống.';
    newErrors.receiverPhone = /^\d{10}$/.test(formData.receiverPhone) ? '' : 'Số điện thoại phải là số và có 10 chữ số.';
    newErrors.receiverAddress = formData.receiverAddress ? '' : 'Địa chỉ không được để trống.';
    newErrors.receiverDistrict = formData.receiverDistrict ? '' : 'Vui lòng chọn Quận/Huyện.';
    newErrors.receiverWard = formData.receiverWard ? '' : 'Vui lòng chọn Phường/Xã.';

    const itemErrors = formData.items.map((item) => ({
      itemName: item.itemName ? '' : 'Tên hàng hóa không được để trống.',
      quantity: item.quantity && !isNaN(item.quantity) && parseInt(item.quantity) > 0 ? '' : 'Số lượng phải là số nguyên dương.',
      weight: item.weight && !isNaN(item.weight) && parseFloat(item.weight) > 0 ? '' : 'Trọng lượng phải là số dương.',
      length: item.length && !isNaN(item.length) && parseFloat(item.length) > 0 ? '' : 'Chiều dài phải là số dương.',
      width: item.width && !isNaN(item.width) && parseFloat(item.width) > 0 ? '' : 'Chiều rộng phải là số dương.',
      height: item.height && !isNaN(item.height) && parseFloat(item.height) > 0 ? '' : 'Chiều cao phải là số dương.',
    }));
    newErrors.items = itemErrors;

    setErrors(newErrors);

    const hasErrors = Object.keys(newErrors).some((key) => {
      if (key === 'items') {
        return newErrors.items.some((item) =>
          Object.values(item).some((error) => error !== '')
        );
      }
      return newErrors[key] !== '';
    });

    console.log('Validation errors:', newErrors);
    console.log('Form valid:', !hasErrors);

    return !hasErrors;
  };

  const toggleDropdown = (field) => {
    setShowDropdown((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          itemName: '',
          quantity: 1,
          weight: '',
          length: '',
          width: '',
          height: '',
          notes: '',
        },
      ],
    });
    setErrors((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { itemName: '', quantity: '', weight: '', length: '', width: '', height: '' },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: updatedItems });
      setErrors((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateTotalCost = () => {
    let total = 0;

    const baseFee = 15500;
    const deliveryFee = formData.deliveryType === 'express' ? 20000 : 0;

    let totalWeight = 0;
    let totalVolume = 0;
    formData.items.forEach((item) => {
      const weight = parseFloat(item.weight) || 0; // gam
      const length = parseFloat(item.length) || 0; // cm
      const width = parseFloat(item.width) || 0; // cm
      const height = parseFloat(item.height) || 0; // cm
      const quantity = parseInt(item.quantity) || 1;

      totalWeight += (weight / 1000) * quantity; // Chuyển sang kg
      totalVolume += (length * width * height) * quantity; // cm³
    });

    const weightExceeded = totalWeight > 50;

    let weightFee = 0;
    if (!weightExceeded && totalWeight > 0) {
      if (totalWeight <= 10) {
        weightFee = totalWeight * 6000;
      } else if (totalWeight <= 20) {
        weightFee = (10 * 6000) + ((totalWeight - 10) * 5000);
      } else if (totalWeight <= 30) {
        weightFee = (10 * 6000) + (10 * 5000) + ((totalWeight - 20) * 4000);
      } else if (totalWeight <= 50) {
        weightFee = (10 * 6000) + (10 * 5000) + (10 * 4000) + ((totalWeight - 30) * 3000);
      }
    }

    let sizeFee = 0;
    if (totalVolume > 100000) {
      if (totalVolume <= 300000) {
        sizeFee = (totalVolume - 100000) * 0.08;
      } else if (totalVolume <= 500000) {
        sizeFee = (200000 * 0.08) + ((totalVolume - 300000) * 0.12);
      } else {
        sizeFee = (200000 * 0.08) + (200000 * 0.12) + ((totalVolume - 500000) * 0.15);
      }
    }

    let distanceFee = 0;
    const distance = formData.distance || 0;
    if (distance > 0) {
      if (distance <= 5) {
        distanceFee = distance * 8000;
      } else if (distance <= 10) {
        distanceFee = (5 * 8000) + ((distance - 5) * 6000);
      } else {
        distanceFee = (5 * 8000) + (5 * 6000) + ((distance - 10) * 5000);
      }
    }

    total = baseFee + weightFee + sizeFee + distanceFee + deliveryFee;
    const vat = total * 0.05;
    total += vat;

    return {
      baseFee,
      deliveryFee,
      weightFee,
      sizeFee,
      distanceFee,
      vat,
      total: weightExceeded ? 0 : Math.round(total),
      weightExceeded,
    };
  };

  useEffect(() => {
    const isItemsComplete = formData.items.every((item) =>
      item.itemName && item.weight && item.length && item.width && item.height
    );
    if (isItemsComplete && formData.items.length > 0) {
      const costs = calculateTotalCost();
      setFormData((prev) => ({ ...prev, totalCost: costs.total }));
      setWeightWarning(costs.weightExceeded);
    } else {
      setFormData((prev) => ({ ...prev, totalCost: 0 }));
      setWeightWarning(false);
    }
  }, [formData.items, formData.deliveryType, formData.distance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Vui lòng kiểm tra lại thông tin!',
        });
        return;
    }

    const costs = calculateTotalCost();
    if (costs.weightExceeded) {
        Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo',
            text: 'Tổng trọng lượng không được vượt quá 50kg! Vui lòng điều chỉnh.',
        });
        return;
    }

    setLoading(true);
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa đăng nhập',
                text: 'Vui lòng đăng nhập để tạo đơn hàng!',
            });
            setLoading(false);
            return;
        }

        if (!formData.items || formData.items.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Vui lòng thêm ít nhất một mặt hàng!',
            });
            setLoading(false);
            return;
        }

        // Gộp tất cả notes từ items thành một chuỗi
        const combinedNotes = formData.items
            .map((item, index) => item.notes ? `SP ${index + 1}: ${item.notes}` : null)
            .filter(note => note) // Loại bỏ các giá trị null/undefined
            .join('; '); // Phân cách bằng dấu chấm phẩy

        const orderPayload = {
            SenderName: formData.senderName,
            SenderPhone: formData.senderPhone,
            SenderAddress: `${formData.senderAddress}, ${getSelectedName(formData.senderWard, wards.sender, 'senderWard')}, ${getSelectedName(formData.senderDistrict, districts.sender, 'senderDistrict')}, ${getSelectedName(formData.senderProvince, provinces, 'senderProvince')}`,
            ReceiverName: formData.receiverName,
            ReceiverPhone: formData.receiverPhone,
            ReceiverAddress: `${formData.receiverAddress}, ${getSelectedName(formData.receiverWard, wards.receiver, 'receiverWard')}, ${getSelectedName(formData.receiverDistrict, districts.receiver, 'receiverDistrict')}, ${getSelectedName(formData.receiverProvince, provinces, 'receiverProvince')}`,
            Weight: formData.items.reduce((sum, item) => sum + (parseFloat(item.weight) / 1000 || 0) * (parseInt(item.quantity) || 1), 0),
            Volume: formData.items.reduce((sum, item) => sum + (parseFloat(item.length) * parseFloat(item.width) * parseFloat(item.height) || 0) * (parseInt(item.quantity) || 1), 0),
            Distance: formData.distance,
            DeliveryType: formData.deliveryType,
            TotalCost: formData.totalCost,
            ItemName: formData.items.map(item => item.itemName).join(', ') || "Hàng hóa mặc định",
            PaymentBy: formData.paymentMethod === 'sender' ? 'Sender' : 'Receiver',
            PaymentStatus: formData.paymentStatus,
            Notes: combinedNotes || null // Gửi chuỗi notes gộp từ items
        };

        console.log("Dữ liệu gửi lên server:", orderPayload);

        const response = await axios.post(
            "http://localhost:5000/api/orders/create",
            orderPayload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Kết quả từ server:", response.data);
        Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: `Đơn hàng ${response.data.orderId} đã được tạo thành công!`,
        }).then(() => {
            navigate("/notifications");
        });
    } catch (err) {
        console.error("Lỗi khi tạo đơn hàng:", err.response?.data || err.message);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.response?.data?.message || "Lỗi khi tạo đơn hàng, vui lòng thử lại!",
        });
    } finally {
        setLoading(false);
    }
};

  const handlePayment = () => {
    console.log('Current formData:', formData);
    console.log('Items in formData:', formData.items);
    const isValid = validateForm();
    console.log('Form valid:', isValid);
    if (isValid) {
      const costs = calculateTotalCost();
      console.log('Costs:', costs);
      console.log('Weight warning:', costs.weightExceeded);
      if (costs.weightExceeded) {
        Swal.fire({
          icon: 'warning',
          title: 'Cảnh báo',
          text: 'Tổng trọng lượng không được vượt quá 50kg! Vui lòng điều chỉnh.',
        });
      } else {
        console.log('Showing payment modal');
        setShowPaymentModal(true);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Vui lòng điền đầy đủ và đúng thông tin trước khi thanh toán.',
      });
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentSuccessful(true);
    setShowPaymentModal(false);
    setFormData((prev) => ({
      ...prev,
      paymentStatus: 'Paid'
    }));
    Swal.fire({
      icon: 'success',
      title: 'Thành công',
      text: 'Thanh toán thành công!',
    });
  };

  const getSelectedName = (value, list, field) => {
    const item = list.find((i) => i.code === value);
    if (item) return item.name;
    if (field.includes('Province')) return 'Nhập Tỉnh/Thành phố';
    if (field.includes('District')) return 'Nhập Quận/Huyện';
    if (field.includes('Ward')) return 'Nhập Phường/Xã';
    return 'Chọn...';
  };

  const handleSearchChange = (field, value) => {
    setSearchTerms((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filterList = (list, searchTerm) => {
    if (!searchTerm) return list;
    return list.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.createOrderContainer}>
        <div className={styles.formSection}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>THÔNG TIN NGƯỜI GỬI</legend>
            <div className={styles.infoContainer}>
              <div className={styles.leftColumn}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Họ và tên</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="senderName"
                    placeholder="Nhập tên người gửi"
                    value={formData.senderName}
                    onChange={handleChange}
                  />
                  {errors.senderName && <p className={styles.error}>{errors.senderName}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Số điện thoại</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="senderPhone"
                    placeholder="Nhập số điện thoại"
                    value={formData.senderPhone}
                    onChange={handleChange}
                  />
                  {errors.senderPhone && <p className={styles.error}>{errors.senderPhone}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Địa chỉ</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="senderAddress"
                    placeholder="Nhập địa chỉ (số nhà, đường)"
                    value={formData.senderAddress}
                    onChange={handleChange}
                  />
                  {errors.senderAddress && <p className={styles.error}>{errors.senderAddress}</p>}
                </div>
              </div>
              <div className={styles.rightColumn}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Tỉnh / Thành phố</label>
                  <div
                    className={styles.customSelect}
                    onClick={() => toggleDropdown('senderProvince')}
                  >
                    <span className={styles.selectValue}>
                      {getSelectedName(formData.senderProvince, provinces, 'senderProvince')}
                    </span>
                    {showDropdown.senderProvince && (
                      <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className={styles.searchInput}
                          placeholder="Tìm kiếm Tỉnh/Thành phố..."
                          value={searchTerms.senderProvince}
                          onChange={(e) => handleSearchChange('senderProvince', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <ul className={styles.dropdown}>
                          {filterList(provinces, searchTerms.senderProvince).length > 0 ? (
                            filterList(provinces, searchTerms.senderProvince).map((province) => (
                              <li
                                key={province.code}
                                className={styles.dropdownItem}
                                onClick={() =>
                                  handleChange({ target: { name: 'senderProvince', value: province.code } })
                                }
                              >
                                {province.name}
                              </li>
                            ))
                          ) : (
                            <li className={styles.noResults}>Không tìm thấy kết quả</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.senderProvince && <p className={styles.error}>{errors.senderProvince}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Quận / Huyện</label>
                  <div
                    className={styles.customSelect}
                    onClick={() => formData.senderProvince && toggleDropdown('senderDistrict')}
                  >
                    <span className={styles.selectValue}>
                      {getSelectedName(formData.senderDistrict, districts.sender, 'senderDistrict')}
                    </span>
                    {showDropdown.senderDistrict && formData.senderProvince && (
                      <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className={styles.searchInput}
                          placeholder="Tìm kiếm Quận/Huyện..."
                          value={searchTerms.senderDistrict}
                          onChange={(e) => handleSearchChange('senderDistrict', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <ul className={styles.dropdown}>
                          {filterList(districts.sender, searchTerms.senderDistrict).length > 0 ? (
                            filterList(districts.sender, searchTerms.senderDistrict).map((district) => (
                              <li
                                key={district.code}
                                className={styles.dropdownItem}
                                onClick={() =>
                                  handleChange({ target: { name: 'senderDistrict', value: district.code } })
                                }
                              >
                                {district.name}
                              </li>
                            ))
                          ) : (
                            <li className={styles.noResults}>Không tìm thấy kết quả</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.senderDistrict && <p className={styles.error}>{errors.senderDistrict}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Phường / Xã</label>
                  <div
                    className={styles.customSelect}
                    onClick={() => formData.senderDistrict && toggleDropdown('senderWard')}
                  >
                    <span className={styles.selectValue}>
                      {getSelectedName(formData.senderWard, wards.sender, 'senderWard')}
                    </span>
                    {showDropdown.senderWard && formData.senderDistrict && (
                      <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className={styles.searchInput}
                          placeholder="Tìm kiếm Phường/Xã..."
                          value={searchTerms.senderWard}
                          onChange={(e) => handleSearchChange('senderWard', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <ul className={styles.dropdown}>
                          {filterList(wards.sender, searchTerms.senderWard).length > 0 ? (
                            filterList(wards.sender, searchTerms.senderWard).map((ward) => (
                              <li
                                key={ward.code}
                                className={styles.dropdownItem}
                                onClick={() =>
                                  handleChange({ target: { name: 'senderWard', value: ward.code } })
                                }
                              >
                                {ward.name}
                              </li>
                            ))
                          ) : (
                            <li className={styles.noResults}>Không tìm thấy kết quả</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.senderWard && <p className={styles.error}>{errors.senderWard}</p>}
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>THÔNG TIN NGƯỜI NHẬN</legend>
            <div className={styles.infoContainer}>
              <div className={styles.leftColumn}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Họ và tên</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="receiverName"
                    placeholder="Nhập tên người nhận"
                    value={formData.receiverName}
                    onChange={handleChange}
                  />
                  {errors.receiverName && <p className={styles.error}>{errors.receiverName}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Số điện thoại</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="receiverPhone"
                    placeholder="Nhập số điện thoại"
                    value={formData.receiverPhone}
                    onChange={handleChange}
                  />
                  {errors.receiverPhone && <p className={styles.error}>{errors.receiverPhone}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Địa chỉ</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="receiverAddress"
                    placeholder="Nhập địa chỉ (số nhà, đường)"
                    value={formData.receiverAddress}
                    onChange={handleChange}
                  />
                  {errors.receiverAddress && <p className={styles.error}>{errors.receiverAddress}</p>}
                </div>
              </div>
              <div className={styles.rightColumn}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Tỉnh / Thành phố</label>
                  <div
                    className={styles.customSelect}
                    onClick={() => toggleDropdown('receiverProvince')}
                  >
                    <span className={styles.selectValue}>
                      {getSelectedName(formData.receiverProvince, provinces, 'receiverProvince')}
                    </span>
                    {showDropdown.receiverProvince && (
                      <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className={styles.searchInput}
                          placeholder="Tìm kiếm Tỉnh/Thành phố..."
                          value={searchTerms.receiverProvince}
                          onChange={(e) => handleSearchChange('receiverProvince', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <ul className={styles.dropdown}>
                          {filterList(provinces, searchTerms.receiverProvince).length > 0 ? (
                            filterList(provinces, searchTerms.receiverProvince).map((province) => (
                              <li
                                key={province.code}
                                className={styles.dropdownItem}
                                onClick={() =>
                                  handleChange({ target: { name: 'receiverProvince', value: province.code } })
                                }
                              >
                                {province.name}
                              </li>
                            ))
                          ) : (
                            <li className={styles.noResults}>Không tìm thấy kết quả</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.receiverProvince && <p className={styles.error}>{errors.receiverProvince}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Quận / Huyện</label>
                  <div
                    className={styles.customSelect}
                    onClick={() => formData.receiverProvince && toggleDropdown('receiverDistrict')}
                  >
                    <span className={styles.selectValue}>
                      {getSelectedName(formData.receiverDistrict, districts.receiver, 'receiverDistrict')}
                    </span>
                    {showDropdown.receiverDistrict && formData.receiverProvince && (
                      <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className={styles.searchInput}
                          placeholder="Tìm kiếm Quận/Huyện..."
                          value={searchTerms.receiverDistrict}
                          onChange={(e) => handleSearchChange('receiverDistrict', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <ul className={styles.dropdown}>
                          {filterList(districts.receiver, searchTerms.receiverDistrict).length > 0 ? (
                            filterList(districts.receiver, searchTerms.receiverDistrict).map((district) => (
                              <li
                                key={district.code}
                                className={styles.dropdownItem}
                                onClick={() =>
                                  handleChange({ target: { name: 'receiverDistrict', value: district.code } })
                                }
                              >
                                {district.name}
                              </li>
                            ))
                          ) : (
                            <li className={styles.noResults}>Không tìm thấy kết quả</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.receiverDistrict && <p className={styles.error}>{errors.receiverDistrict}</p>}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Phường / Xã</label>
                  <div
                    className={styles.customSelect}
                    onClick={() => formData.receiverDistrict && toggleDropdown('receiverWard')}
                  >
                    <span className={styles.selectValue}>
                      {getSelectedName(formData.receiverWard, wards.receiver, 'receiverWard')}
                    </span>
                    {showDropdown.receiverWard && formData.receiverDistrict && (
                      <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className={styles.searchInput}
                          placeholder="Tìm kiếm Phường/Xã..."
                          value={searchTerms.receiverWard}
                          onChange={(e) => handleSearchChange('receiverWard', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <ul className={styles.dropdown}>
                          {filterList(wards.receiver, searchTerms.receiverWard).length > 0 ? (
                            filterList(wards.receiver, searchTerms.receiverWard).map((ward) => (
                              <li
                                key={ward.code}
                                className={styles.dropdownItem}
                                onClick={() =>
                                  handleChange({ target: { name: 'receiverWard', value: ward.code } })
                                }
                              >
                                {ward.name}
                              </li>
                            ))
                          ) : (
                            <li className={styles.noResults}>Không tìm thấy kết quả</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.receiverWard && <p className={styles.error}>{errors.receiverWard}</p>}
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>THÔNG TIN HÀNG HÓA</legend>
            <div className={styles.itemContainer}>
              {formData.items.map((item, index) => (
                <div key={index} className={styles.itemEntry}>
                  <h4 className={styles.itemTitle}>SP {index + 1}</h4>
                  <div className={styles.itemRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Tên hàng hóa</label>
                      <input
                        className={styles.input}
                        type="text"
                        name="itemName"
                        placeholder="Nhập tên hàng hóa"
                        value={item.itemName}
                        onChange={(e) => handleChange(e, index)}
                      />
                      {errors.items[index]?.itemName && <p className={styles.error}>{errors.items[index].itemName}</p>}
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Số lượng</label>
                      <input
                        className={styles.input}
                        type="number"
                        name="quantity"
                        min="1"
                        placeholder="Nhập số lượng"
                        value={item.quantity}
                        onChange={(e) => handleChange(e, index)}
                      />
                      {errors.items[index]?.quantity && <p className={styles.error}>{errors.items[index].quantity}</p>}
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Trọng lượng (gam)</label>
                      <input
                        className={styles.input}
                        type="number"
                        name="weight"
                        placeholder="Nhập trọng lượng"
                        value={item.weight}
                        onChange={(e) => handleChange(e, index)}
                      />
                      {errors.items[index]?.weight && <p className={styles.error}>{errors.items[index].weight}</p>}
                    </div>
                  </div>
                  <div className={styles.sizeRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Chiều dài (cm)</label>
                      <input
                        className={styles.input}
                        type="number"
                        name="length"
                        placeholder="Nhập chiều dài"
                        value={item.length}
                        onChange={(e) => handleChange(e, index)}
                      />
                      {errors.items[index]?.length && <p className={styles.error}>{errors.items[index].length}</p>}
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Chiều rộng (cm)</label>
                      <input
                        className={styles.input}
                        type="number"
                        name="width"
                        placeholder="Nhập chiều rộng"
                        value={item.width}
                        onChange={(e) => handleChange(e, index)}
                      />
                      {errors.items[index]?.width && <p className={styles.error}>{errors.items[index].width}</p>}
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Chiều cao (cm)</label>
                      <input
                        className={styles.input}
                        type="number"
                        name="height"
                        placeholder="Nhập chiều cao"
                        value={item.height}
                        onChange={(e) => handleChange(e, index)}
                      />
                      {errors.items[index]?.height && <p className={styles.error}>{errors.items[index].height}</p>}
                    </div>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Ghi chú</label>
                    <textarea
                      className={styles.textarea}
                      name="notes"
                      placeholder="Nhập ghi chú (nếu có)"
                      value={item.notes}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeItemButton}
                      onClick={() => removeItem(index)}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Xóa sản phẩm
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className={styles.addItemButton} onClick={addItem}>
                Thêm sản phẩm
              </button>
            </div>
          </fieldset>
        </div>

        <div className={styles.paymentSection}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>THÔNG TIN THANH TOÁN</legend>
            <div className={styles.paymentRow}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Hình thức giao hàng</label>
                <select
                  className={styles.select}
                  name="deliveryType"
                  value={formData.deliveryType}
                  onChange={handleChange}
                >
                  <option value="standard">Giao thường</option>
                  <option value="express">Giao nhanh</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Hình thức thanh toán</label>
                <select
                  className={styles.select}
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="sender">Người gửi trả</option>
                  <option value="receiver">Người nhận trả (COD)</option>
                </select>
              </div>
            </div>
            {weightWarning && (
              <p className={styles.error} style={{ color: 'red', marginBottom: '10px' }}>
                Tổng trọng lượng không được vượt quá 50kg! Vui lòng điều chỉnh.
              </p>
            )}
            <div className={styles.costBreakdown}>
              <div className={styles.costLeft}>
                <p>Phí cơ bản:</p>
                <p>Phí trọng lượng:</p>
                <p>Phí kích thước:</p>
                <p>Phí khoảng cách ({formData.distance.toFixed(2)} km):</p>
                {formData.deliveryType === 'express' && <p>Phí giao nhanh:</p>}
                <p>VAT (5%):</p>
                <p className={styles.totalLabel}>Tổng phí:</p>
              </div>
              <div className={styles.costRight}>
                {formData.totalCost > 0 ? (
                  (() => {
                    const costs = calculateTotalCost();
                    return (
                      <>
                        <p>{costs.baseFee.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</p>
                        <p>{costs.weightFee.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</p>
                        <p>{costs.sizeFee.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</p>
                        <p>{costs.distanceFee.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</p>
                        {formData.deliveryType === 'express' && (
                          <p>{costs.deliveryFee.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</p>
                        )}
                        <p>{costs.vat.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</p>
                        <p className={styles.totalAmount}>
                          {costs.total.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ
                        </p>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <p>0 VNĐ</p>
                    <p>0 VNĐ</p>
                    <p>0 VNĐ</p>
                    <p>0 VNĐ</p>
                    {formData.deliveryType === 'express' && <p>0 VNĐ</p>}
                    <p>0 VNĐ</p>
                    <p className={styles.totalAmount}>0 VNĐ</p>
                  </>
                )}
              </div>
            </div>
            <div className={styles.buttonRow}>
              <button
                className={styles.paymentButton}
                onClick={handlePayment}
                disabled={formData.paymentMethod === 'receiver' || weightWarning}
              >
                Thanh toán
              </button>
              <button
                className={styles.createOrderButton}
                onClick={handleSubmit}
                disabled={(formData.paymentMethod === 'sender' && !isPaymentSuccessful) || weightWarning || loading}
              >
                {loading ? "Đang xử lý..." : "Tạo đơn hàng"}
              </button>
            </div>
          </fieldset>
        </div>
      </div>

      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.paymentModal}>
            <h3>Thanh toán đơn hàng</h3>
            <div className={styles.qrCode}>
              <p>Mã QR:</p>
              <QRCodeCanvas value={`STK: 8386999999 - Ngân hàng: Vietcombank - Số tiền: ${formData.totalCost} VNĐ`} size={150} />
            </div>
            <div className={styles.bankInfo}>
              <p><strong>Tên tài khoản:</strong> GIAO HÀNG NHANH</p>
              <p><strong>Số tài khoản:</strong> 8386999999</p>
              <p><strong>Ngân hàng:</strong> Vietcombank</p>
              <p><strong>Số tiền:</strong> {formData.totalCost.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</p>
            </div>
            <button className={styles.successButton} onClick={handlePaymentSuccess}>
              Quét mã thành công
            </button>
            <button className={styles.closeButton} onClick={() => setShowPaymentModal(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;