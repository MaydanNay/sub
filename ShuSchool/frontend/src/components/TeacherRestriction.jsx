import React from 'react';
import { ShieldAlert, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TeacherRestriction = () => {
    const { t } = useLanguage();

    return (
        <div className="restriction-container animate-fade-in">
            <div className="restriction-card card">
                <div className="restriction-icon">
                    <Zap size={48} color="var(--accent-yellow)" />
                </div>
                <h3>{t('access_limited_title') || "Доступ ограничен"}</h3>
                <p>
                    {t('unassigned_teacher_warning') || "Администрация школы еще не назначила вам классы или предметы. Обратитесь к администратору для получения доступа к функциям школы."}
                </p>
                <div className="restriction-footer">
                    <span>ShuSchool Admin Control</span>
                </div>
            </div>

            <style jsx>{`
                .restriction-container {
                    padding: 40px 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 60vh;
                }
                .restriction-card {
                    max-width: 400px;
                    width: 100%;
                    padding: 40px 30px;
                    text-align: center;
                    border: 1px dashed rgba(255, 215, 0, 0.3);
                    background: rgba(255, 215, 0, 0.02);
                    border-radius: 24px;
                }
                .restriction-icon {
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: center;
                }
                h3 {
                    font-size: 22px;
                    font-weight: 800;
                    margin-bottom: 15px;
                    color: var(--accent-yellow);
                }
                p {
                    color: #ccc;
                    font-size: 14px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }
                .restriction-footer {
                    font-size: 11px;
                    color: #555;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
};

export default TeacherRestriction;
