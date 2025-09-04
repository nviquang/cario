import { useState, useEffect } from 'react';
import { Question } from '@/types';

interface QuestionFormData {
  content: string;
  type: string;
  answers: { id: number; content: string }[];
}

export const ManageQuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>({
    content: '',
    type: 'easy',
    answers: [
      { id: 1, content: '' },
      { id: 2, content: '' },
      { id: 3, content: '' },
      { id: 4, content: '' }
    ]
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mock data cho demo
  useEffect(() => {
    const mockQuestions: Question[] = [
      {
        id: 1,
        content: 'Thủ đô của Việt Nam là gì?',
        type: 'easy',
        answers: [
          { id: 1, content: 'Hà Nội' },
          { id: 2, content: 'TP.HCM' },
          { id: 3, content: 'Đà Nẵng' },
          { id: 4, content: 'Huế' }
        ]
      },
      {
        id: 2,
        content: 'Việt Nam có bao nhiêu tỉnh thành?',
        type: 'easy',
        answers: [
          { id: 5, content: '61' },
          { id: 6, content: '62' },
          { id: 7, content: '63' },
          { id: 8, content: '64' }
        ]
      }
    ];
    setQuestions(mockQuestions);
  }, []);

  const resetForm = () => {
    setFormData({
      content: '',
      type: 'easy',
      answers: [
        { id: 1, content: '' },
        { id: 2, content: '' },
        { id: 3, content: '' },
        { id: 4, content: '' }
      ]
    });
    setEditingQuestion(null);
  };

  const openModal = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        content: question.content,
        type: question.type,
        answers: [...question.answers]
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (field: keyof QuestionFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = { ...newAnswers[index], content: value };
    setFormData(prev => ({ ...prev, answers: newAnswers }));
  };

  const validateForm = (): boolean => {
    if (!formData.content.trim()) {
      alert('Vui lòng nhập câu hỏi');
      return false;
    }
    if (formData.answers.some(answer => !answer.content.trim())) {
      alert('Vui lòng nhập đầy đủ 4 lựa chọn');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (editingQuestion) {
        // Cập nhật câu hỏi
        const updatedQuestion: Question = {
          ...editingQuestion,
          ...formData
        };
        
        setQuestions(prev => 
          prev.map(q => q.id === editingQuestion.id ? updatedQuestion : q)
        );
        
        // TODO: Gọi API cập nhật
        console.log('Cập nhật câu hỏi:', updatedQuestion);
      } else {
        // Thêm câu hỏi mới
        const newQuestion: Question = {
          id: Date.now(),
          ...formData
        };
        
        setQuestions(prev => [...prev, newQuestion]);
        
        // TODO: Gọi API thêm mới
        console.log('Thêm câu hỏi mới:', newQuestion);
      }
      
      closeModal();
    } catch (error) {
      console.error('Lỗi khi lưu câu hỏi:', error);
      alert('Có lỗi xảy ra khi lưu câu hỏi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (questionId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

    try {
      // TODO: Gọi API xóa
      console.log('Xóa câu hỏi:', questionId);
      
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Lỗi khi xóa câu hỏi:', error);
      alert('Có lỗi xảy ra khi xóa câu hỏi');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Quản lý câu hỏi</h1>
          <button 
            className="add-question-btn"
            onClick={() => openModal()}
          >
            + Thêm câu hỏi mới
          </button>
        </div>

        <div className="questions-table">
          <div className="table-header">
            <div className="table-cell">Câu hỏi</div>
            <div className="table-cell">Lựa chọn</div>
            <div className="table-cell">Đáp án</div>
            <div className="table-cell">Thao tác</div>
          </div>
          
          {questions.map(question => (
            <div key={question.id} className="table-row">
              <div className="table-cell question-text">
                {question.content}
              </div>
              <div className="table-cell choices">
                {question.answers.map((answer, index) => (
                  <div key={answer.id} className={`choice ${index === 0 ? 'correct' : ''}`}>
                    {String.fromCharCode(65 + index)}. {answer.content}
                  </div>
                ))}
              </div>
              <div className="table-cell answer">
                <span className="correct-answer">{question.answers[0]?.content}</span>
              </div>
              <div className="table-cell actions">
                <button 
                  className="edit-btn"
                  onClick={() => openModal(question)}
                >
                  Sửa
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(question.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="empty-state">
            <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!</p>
          </div>
        )}
      </div>

      {/* Modal thêm/sửa câu hỏi */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="question-form">
              <div className="form-group">
                <label>Loại câu hỏi:</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  required
                >
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>

              <div className="form-group">
                <label>Câu hỏi:</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Lựa chọn:</label>
                {formData.answers.map((answer, index) => (
                  <div key={answer.id} className="choice-input">
                    <span className="choice-label">{String.fromCharCode(65 + index)}.</span>
                    <input
                      type="text"
                      value={answer.content}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                      required
                    />
                  </div>
                ))}
                <small className="form-help">Lựa chọn đầu tiên sẽ được coi là đáp án đúng</small>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={isLoading}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang lưu...' : (editingQuestion ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
