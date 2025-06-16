"use client";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>
        
        <div className="space-y-6 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제1조 (목적)</h2>
            <p>본 약관은 SaveMyEssay(이하 "회사")가 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제2조 (용어의 정의)</h2>
            <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>"서비스"란 회사가 제공하는 모든 서비스를 의미합니다.</li>
              <li>"회원"이란 회사와 서비스 이용계약을 체결한 자를 말합니다.</li>
              <li>"이용자"란 회사의 서비스를 이용하는 회원을 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제3조 (서비스의 제공)</h2>
            <p>회사는 다음과 같은 서비스를 제공합니다:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>에세이 작성 및 편집 서비스</li>
              <li>문법 및 맞춤법 검사 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제4조 (서비스 이용)</h2>
            <p>서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제5조 (개인정보보호)</h2>
            <p>회사는 관련법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련법 및 회사의 개인정보처리방침이 적용됩니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제6조 (회사의 의무)</h2>
            <p>회사는 안정적인 서비스 제공을 위해 최선을 다하며, 회원의 개인정보를 보호하기 위해 보안시스템을 갖추고 개인정보처리방침을 공시하고 준수합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제7조 (회원의 의무)</h2>
            <p>회원은 다음 행위를 해서는 안 됩니다:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보의 송신 또는 게시</li>
              <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사와 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제8조 (약관의 변경)</h2>
            <p>회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항에 게시하거나 기타 방법으로 회원에게 공지함으로써 효력이 발생합니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
} 