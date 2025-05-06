'use client'

import { useRef, useEffect } from 'react';

const ImageSelect = ({ onSelect }: { onSelect: (file: FileList) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const initial = useRef(true); // useRef로 재렌더링 막기 (useState 는 사진 선택 창을 두 번 실행함)

    useEffect(() => {
        if (initial.current) {
            inputRef.current?.click();
            initial.current = false;
        }
    }, []);

    return (
        <input
            type="file"
            accept="image/*"
            multiple
            ref={inputRef}
            onChange={(e) => {
                if (e.target.files) {
                    onSelect(e.target.files);
                }
            }}
            className="hidden"
        />
    );
};

export default ImageSelect;
