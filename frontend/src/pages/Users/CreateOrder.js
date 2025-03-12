import React, { useState } from 'react';

const CreateOrder = () => {
  const [orderData, setOrderData] = useState({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    deliveryAddress: '',
    productType: '',
    productSize: '',
    productWeight: '',
    deliveryMethod: '',
    paymentMethod: '',
    deliveryDate: '',
    specialNotes: '',
    shippingCost: '',
    trackingNumber: '',
    orderStatus: 'Chờ xử lý', // Trạng thái mặc định của đơn hàng
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData({
      ...orderData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý khi gửi đơn hàng, như gửi đến backend hoặc lưu trữ vào cơ sở dữ liệu
    console.log(orderData);
  };

  return (
    <div>
      <h1>Tạo Đơn Hàng</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <h2>Thông tin người gửi</h2>
          <input
            type="text"
            name="senderName"
            value={orderData.senderName}
            onChange={handleChange}
            placeholder="Họ tên người gửi"
          />
          <input
            type="text"
            name="senderPhone"
            value={orderData.senderPhone}
            onChange={handleChange}
            placeholder="Số điện thoại người gửi"
          />
          <input
            type="text"
            name="senderAddress"
            value={orderData.senderAddress}
            onChange={handleChange}
            placeholder="Địa chỉ người gửi"
          />
        </div>

        <div>
          <h2>Thông tin người nhận</h2>
          <input
            type="text"
            name="receiverName"
            value={orderData.receiverName}
            onChange={handleChange}
            placeholder="Họ tên người nhận"
          />
          <input
            type="text"
            name="receiverPhone"
            value={orderData.receiverPhone}
            onChange={handleChange}
            placeholder="Số điện thoại người nhận"
          />
          <input
            type="text"
            name="receiverAddress"
            value={orderData.receiverAddress}
            onChange={handleChange}
            placeholder="Địa chỉ người nhận"
          />
        </div>

        <div>
          <h2>Địa chỉ giao hàng</h2>
          <input
            type="text"
            name="deliveryAddress"
            value={orderData.deliveryAddress}
            onChange={handleChange}
            placeholder="Địa chỉ người nhận hoặc giao hàng"
          />
          <div>
            <label>Chọn địa điểm</label>
            {/* Thêm tích hợp bản đồ ở đây */}
            <input type="text" placeholder="Tích hợp bản đồ ở đây" />
          </div>
        </div>

        <div>
          <h2>Thông tin hàng hoá</h2>
          <input
            type="text"
            name="productType"
            value={orderData.productType}
            onChange={handleChange}
            placeholder="Loại hàng hoá"
          />
          <input
            type="text"
            name="productSize"
            value={orderData.productSize}
            onChange={handleChange}
            placeholder="Kích thước hàng hoá"
          />
          <input
            type="number"
            name="productWeight"
            value={orderData.productWeight}
            onChange={handleChange}
            placeholder="Khối lượng hàng hoá (kg)"
          />
        </div>

        <div>
          <h2>Phương thức giao hàng</h2>
          <select
            name="deliveryMethod"
            value={orderData.deliveryMethod}
            onChange={handleChange}
          >
            <option value="">Chọn phương thức giao hàng</option>
            <option value="standard">Giao tiêu chuẩn</option>
            <option value="express">Giao nhanh</option>
          </select>
        </div>

        <div>
          <h2>Phương thức thanh toán</h2>
          <select
            name="paymentMethod"
            value={orderData.paymentMethod}
            onChange={handleChange}
          >
            <option value="">Chọn phương thức thanh toán</option>
            <option value="cash">Thanh toán tiền mặt</option>
            <option value="card">Thanh toán qua thẻ</option>
            <option value="online">Thanh toán trực tuyến</option>
          </select>
        </div>

        <div>
          <h2>Ngày giờ giao hàng</h2>
          <input
            type="datetime-local"
            name="deliveryDate"
            value={orderData.deliveryDate}
            onChange={handleChange}
          />
        </div>

        <div>
          <h2>Ghi chú đơn hàng</h2>
          <textarea
            name="specialNotes"
            value={orderData.specialNotes}
            onChange={handleChange}
            placeholder="Ghi chú về đơn hàng"
          />
        </div>

        <div>
          <h2>Thông tin chi phí</h2>
          <input
            type="number"
            name="shippingCost"
            value={orderData.shippingCost}
            onChange={handleChange}
            placeholder="Chi phí vận chuyển"
          />
          <input
            type="text"
            name="trackingNumber"
            value={orderData.trackingNumber}
            onChange={handleChange}
            placeholder="Số tracking (nếu có)"
          />
        </div>

        <div>
          <h2>Trạng thái đơn hàng</h2>
          <select
            name="orderStatus"
            value={orderData.orderStatus}
            onChange={handleChange}
          >
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Đã giao">Đã giao</option>
            <option value="Hủy">Hủy</option>
          </select>
        </div>

        <button type="submit">Tạo Đơn Hàng</button>
      </form>
    </div>
  );
};

export default CreateOrder;
