export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          PORTFOLIO CV HUB
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Platform quản lý portfolio và CV chuyên nghiệp cho ứng viên
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-bold mb-2">📝 Hồ sơ chuyên nghiệp</h3>
            <p className="text-gray-600">Xây dựng hồ sơ hoàn chỉnh với thông tin cá nhân, kỹ năng, kinh nghiệm</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-bold mb-2">💼 Quản lý portfolio</h3>
            <p className="text-gray-600">Thêm và quản lý dự án, CV của bạn dễ dàng</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-lg font-bold mb-2">🔗 Chia sẻ công khai</h3>
            <p className="text-gray-600">Tạo link công khai để chia sẻ portfolio với nhà tuyển dụng</p>
          </div>
        </div>

        <div className="mt-12 flex gap-4 justify-center">
          <a href="/register" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
            Đăng ký ngay
          </a>
          <a href="/login" className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold">
            Đăng nhập
          </a>
        </div>
      </div>
    </div>
  )
}
