//학교인증

'use client'

import React, { useRef, useState, ChangeEvent } from 'react'

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: '#f5f7fb',
    fontFamily: 'Arial, sans-serif',
    padding: '80px 20px 40px 20px',
    margin: 0,
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    background: '#23A8F2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    boxSizing: 'border-box',
    color: '#ffffff',
    boxShadow: '0 2px 6px rgba(15,23,42,0.25)',
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 18,
    fontWeight: 700,
  },
  headerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    fontSize: 14,
    fontWeight: 500,
  },
  headerNavLink: {
    color: '#ffffff',
    textDecoration: 'none',
  } as React.CSSProperties,
  headerLogin: {
    padding: '6px 12px',
    borderRadius: 999,
    background: '#ffffff',
    color: '#23A8F2',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
  },
  layout: {
    maxWidth: 850,
    margin: '100px auto 40px auto',
    padding: '0 20px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: 700,
    margin: '0 auto',
    background: '#ffffff',
    borderRadius: 24,
    padding: 32,
    boxShadow: '0 8px 30px rgba(15,23,42,0.12)',
    boxSizing: 'border-box',
  },
  title: {
    textAlign: 'left' as const,
    width: '100%',
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: '#1a1a1a',
  },
  subtitle: {
    textAlign: 'left' as const,
    width: '100%',
    color: '#6b7280',
    fontSize: 14,
    marginTop: 6,
  },
  infoBox: {
    background: '#d8eaff',
    border: '1px solid #aacbff',
    padding: 14,
    borderRadius: 14,
    fontSize: 13,
    margin: '20px 0',
    color: '#374151',
    lineHeight: 1.5,
  },
  noteBox: {
    background: '#e4efff',
    border: '1px solid #b4ccff',
    padding: 12,
    borderRadius: 14,
    margin: '16px auto 0 auto',
    fontSize: 11,
    color: '#374151',
    maxWidth: 700,
    width: '100%',
    boxSizing: 'border-box',
  },
  sectionTitle: {
    fontWeight: 700,
    marginBottom: 10,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  uploadArea: {
    border: '2px dashed #9bbcff',
    background: '#e4efff',
    borderRadius: 18,
    height: 380,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#3b6ef5',
    cursor: 'pointer',
  },
  uploadArrow: {
    fontSize: 32,
    marginTop: 0,
  },
  uploadMainText: {
    marginTop: 6,
    fontWeight: 700,
    fontSize: 15,
  },
  uploadSubText: {
    marginTop: 6,
    fontSize: 12,
    color: '#9ca3af',
  },
  previewContainer: {
    display: 'block',
    marginTop: 16,
    textAlign: 'center' as const,
  },
  previewImg: {
    maxWidth: '100%',
    borderRadius: 12,
    marginBottom: 10,
  },
  deleteButton: {
    padding: '8px 14px',
    background: '#ff5c5c',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 12,
  },
  nextBtn: {
    marginTop: 24,
    width: '100%',
    padding: 14,
    background: '#4a74f5',
    color: 'white',
    border: 'none',
    borderRadius: 14,
    fontWeight: 700,
    fontSize: 15,
    boxShadow: '0 4px 12px rgba(30,60,200,0.25)',
    cursor: 'pointer',
  },
}

const SchoolAuthPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div style={styles.page}>
      {/* 본문 */}
      <div style={styles.layout}>
        <div style={styles.card}>
          <h2 style={styles.title}>학교 인증</h2>
          <div style={styles.subtitle}>
            학생증 사진을 업로드하여 학교를 인증하세요
          </div>

          <div style={styles.infoBox}>
            학교 인증을 완료하면 안전한 학교 커뮤니티를 이용할 수 있습니다.
            <br />
            학생증 사진을 업로드하고 다음 단계에서 전화번호 인증을 진행해주세요.
          </div>

          {/* 안내사항 */}
          <div style={styles.noteBox}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>안내사항</div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                lineHeight: 1.6,
              }}
            >
              <li>학생증에서 학교명과 이름이 명확하게 보여야 합니다.</li>
              <li>개인정보 보호를 위해 사진은 안전하게 처리됩니다.</li>
              <li>인증 후 학생증 사진은 자동으로 삭제됩니다.</li>
            </ul>
          </div>

          {/* 학생증 업로드 섹션 */}
          <div style={styles.sectionTitle}>🖼 학생증 사진 업로드</div>

          {!previewUrl && (
            <div style={styles.uploadArea} onClick={handleUploadClick}>
              <div style={styles.uploadArrow}>⬆</div>
              <div style={styles.uploadMainText}>학생증 사진 선택</div>
              <div style={styles.uploadSubText}>
                JPG, JPEG, PNG, HEIC 형식 지원
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {previewUrl && (
            <div style={styles.previewContainer}>
              <img
                src={previewUrl}
                alt="학생증 미리보기"
                style={styles.previewImg}
              />
              <button
                type="button"
                style={styles.deleteButton}
                onClick={handleRemoveImage}
              >
                사진 삭제
              </button>
            </div>
          )}

          <button type="button" style={styles.nextBtn}>
            다음 단계 (전화번호 인증)
          </button>
        </div>
      </div>
    </div>
  )
}

export default SchoolAuthPage
