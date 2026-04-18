'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center bg-white/10 ring-1 ring-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Nền tảng kết nối nhân tài
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Portfolio CV Hub
            </h1>

          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900">Hồ sơ chuyên nghiệp</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Tạo hồ sơ đầy đủ với thông tin cá nhân, kỹ năng, kinh nghiệm và dự án.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900">Portfolio & CV</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Upload CV, quản lý dự án và trình bày portfolio dưới dạng link công khai.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900">Kết nối nhà tuyển dụng</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              Doanh nghiệp tìm ứng viên qua bộ lọc nâng cao và AI Ranking theo JD.
            </p>
          </div>
        </div>
      </section>

      {/* Split CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Dành cho ứng viên
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
              Xây dựng portfolio ấn tượng trong vài phút
            </h2>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              Hoàn thiện hồ sơ, thêm kỹ năng, kinh nghiệm và dự án. Chia sẻ link công khai
              cho nhà tuyển dụng.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition"
              >
                Tạo hồ sơ
              </Link>
              <Link
                href="/login"
                className="border border-blue-600 text-blue-700 hover:bg-white px-5 py-2.5 rounded-xl font-semibold transition"
              >
                Đăng nhập
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-700">
              Dành cho doanh nghiệp
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900">
              Tìm đúng ứng viên nhanh hơn với AI
            </h2>
            <p className="mt-3 text-sm text-gray-700 leading-relaxed">
              Bộ lọc theo kỹ năng và kinh nghiệm, xếp hạng ứng viên phù hợp với JD của bạn.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/recruiter/register"
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold transition"
              >
                Đăng ký doanh nghiệp
              </Link>
              <Link
                href="/login"
                className="border border-purple-600 text-purple-700 hover:bg-white px-5 py-2.5 rounded-xl font-semibold transition"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Portfolio CV Hub</span>
          <Link href="/login" className="hover:text-gray-800">
            Quản trị viên
          </Link>
        </div>
      </footer>
    </div>
  )
}
