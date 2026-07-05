import React, { useEffect, useState } from 'react';
import type { Document } from '../types';
import { createDocument, deleteDocument, getDocuments, updateDocument } from '../api/document';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data);
      if (!selectedDocument && data.length > 0) {
        selectDocument(data[0]);
      }
    } catch (error) {
      console.error('문서 목록 조회 실패:', error);
      alert('문서 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const selectDocument = (document: Document) => {
    setSelectedDocument(document);
    setFormData({
      title: document.title,
      content: document.content || '',
      tags: document.tags || '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    const title = window.prompt('새 문서 제목을 입력하세요.');
    if (!title?.trim()) return;

    try {
      const document = await createDocument({ title, content: '', tags: '' });
      setDocuments([document, ...documents]);
      selectDocument(document);
    } catch (error: any) {
      alert(error.response?.data?.message || '문서를 생성하지 못했습니다.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocument) return;

    setIsSaving(true);
    try {
      const document = await updateDocument(selectedDocument.id, formData);
      setSelectedDocument(document);
      setDocuments(documents.map((item) => (item.id === document.id ? document : item)));
      alert('문서가 저장되었습니다.');
    } catch (error: any) {
      alert(error.response?.data?.message || '문서를 저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;
    if (!window.confirm('선택한 문서를 삭제할까요?')) return;

    try {
      await deleteDocument(selectedDocument.id);
      const nextDocuments = documents.filter((document) => document.id !== selectedDocument.id);
      setDocuments(nextDocuments);
      if (nextDocuments.length > 0) {
        selectDocument(nextDocuments[0]);
      } else {
        setSelectedDocument(null);
        setFormData({ title: '', content: '', tags: '' });
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '문서를 삭제하지 못했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={sidebarStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ fontSize: 18, margin: 0 }}>내 문서</h1>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>문서 CRUD 기본 기능</p>
          </div>
          <button onClick={handleCreate} style={primaryButtonStyle}>새 문서</button>
        </div>

        {isLoading ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>문서를 불러오는 중입니다...</p>
        ) : documents.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>아직 문서가 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {documents.map((document) => (
              <button
                key={document.id}
                onClick={() => selectDocument(document)}
                style={{
                  ...documentButtonStyle,
                  borderColor: selectedDocument?.id === document.id ? 'var(--color-border-secondary)' : 'var(--color-border-tertiary)',
                  background: selectedDocument?.id === document.id ? 'var(--color-background-secondary)' : 'var(--color-background-primary)',
                }}
              >
                <strong style={{ fontSize: 13 }}>{document.title}</strong>
                <span style={{ color: 'var(--color-text-tertiary)', fontSize: 11 }}>
                  {document.updatedAt?.slice(0, 10)}
                </span>
              </button>
            ))}
          </div>
        )}
      </aside>

      <main style={mainStyle}>
        {selectedDocument ? (
          <form onSubmit={handleSave} style={formStyle}>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="문서 제목"
              required
              style={titleInputStyle}
            />
            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="태그 (예: 기획, 회의록)"
              style={inputStyle}
            />
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="문서 내용을 입력하세요."
              style={textareaStyle}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={isSaving} style={primaryButtonStyle}>
                {isSaving ? '저장 중...' : '저장'}
              </button>
              <button type="button" onClick={handleDelete} style={dangerButtonStyle}>
                삭제
              </button>
            </div>
          </form>
        ) : (
          <div style={{ color: 'var(--color-text-secondary)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 500 }}>문서를 선택하거나 새로 생성하세요.</h2>
          </div>
        )}
      </main>
    </div>
  );
};

const sidebarStyle: React.CSSProperties = { width: 300, padding: 24, borderRight: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-primary)', boxSizing: 'border-box' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 };
const mainStyle: React.CSSProperties = { flex: 1, padding: 32, boxSizing: 'border-box' };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 900 };
const inputStyle: React.CSSProperties = { padding: '10px 12px', fontSize: 14, border: '0.5px solid var(--color-border-secondary)', borderRadius: 8, background: 'var(--color-background-primary)', color: 'var(--color-text-primary)' };
const titleInputStyle: React.CSSProperties = { ...inputStyle, fontSize: 24, fontWeight: 600 };
const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: 480, resize: 'vertical', lineHeight: 1.5 };
const primaryButtonStyle: React.CSSProperties = { padding: '9px 12px', cursor: 'pointer', background: 'var(--color-text-primary)', color: 'var(--color-background-primary)', border: 'none', borderRadius: 8 };
const dangerButtonStyle: React.CSSProperties = { padding: '9px 12px', cursor: 'pointer', background: 'var(--color-background-danger)', color: 'var(--color-text-danger)', border: 'none', borderRadius: 8 };
const documentButtonStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: 12, cursor: 'pointer', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 10, textAlign: 'left' };

export default Documents;
