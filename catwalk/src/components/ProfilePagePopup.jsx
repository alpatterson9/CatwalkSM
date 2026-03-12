// ProfilePagePopup.jsx
import Popup from './Popup';
import TransparentButton from './TransparentButton';

export default function ProfilePagePopup({
    show,
    onClose,
    title,
    onSubmit,
    textValue,
    textPlaceholder,
    onTextChange,
    onImageChange,
    maxLength
}) {
    if (!show) return null;

    const currentLength = textValue ? textValue.length : 0;
    const isOverLimit = maxLength && currentLength > maxLength;

    return (
        <Popup onClose={onClose}>
            <h2>{title}</h2>
            <form
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                }}
            >
                {onImageChange && (
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onImageChange(e.target.files[0])}
                    />
                )}
                {onTextChange && (
                    <>
                        <textarea
                            placeholder={textPlaceholder}
                            style={{
                                width: '300px',
                                height: '80px',
                                fontSize: '12px',
                                resize: 'vertical',
                                padding: '8px',
                                borderRadius: '4px',
                                border: isOverLimit ? '2px solid red' : '1px solid #ccc'
                            }}
                            value={textValue || ''}
                            onChange={(e) => onTextChange(e.target.value)}
                            maxLength={maxLength ? maxLength + 50 : undefined}
                        />
                        {maxLength && (
                            <span style={{
                                fontSize: '12px',
                                color: isOverLimit ? 'red' : '#666',
                                marginTop: '5px'
                            }}>
                                {currentLength}/{maxLength} characters
                            </span>
                        )}
                    </>
                )}
                <TransparentButton type="button" onClick={onSubmit}>
                    {title}
                </TransparentButton>
            </form>
        </Popup>
    );
}
