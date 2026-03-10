/**
 * GPS Art Shape Templates
 * Coordinates are relative offsets from the starting point.
 * Scale: ~0.001 difference is roughly 111 meters.
 */

export const ART_SHAPES = [
    {
        id: 'heart-art',
        name: 'Сердце',
        emoji: '❤️',
        distance: 2.5,
        type: 'art',
        points: [
            [0, 0],               // Start (bottom point)
            [0.002, -0.002],      // Left curve start
            [0.004, -0.002],      // Left curve peak
            [0.004, 0],           // Middle dip
            [0.004, 0.002],       // Right peak
            [0.002, 0.002],       // Right curve end
            [0, 0]                // Return to start
        ]
    },
    {
        id: 'star-art',
        name: 'Звезда',
        emoji: '⭐',
        distance: 4.0,
        type: 'art',
        points: [
            [0, 0],               // Bottom peak
            [0.003, 0.001],       // Mid right
            [0.001, 0.004],       // Far right
            [0.004, 0.002],       // Top right
            [0.007, 0.004],       // Top peak
            [0.005, 0],           // Top left
            [0.007, -0.004],      // Far left
            [0.004, -0.002],      // Bottom left
            [0.001, -0.004],      // Mid left
            [0, 0]                // Return to bottom
        ]
    },
    {
        id: 'shu-logo-art',
        name: 'Лого SHU',
        emoji: '💎',
        distance: 5.5,
        type: 'art',
        points: [
            [0, 0],               // S start
            [0.001, 0.002],
            [0.002, 0],
            [0.003, 0.002],       // S end
            [0.003, 0.004],       // H start
            [0, 0.004],           // H cross
            [0.003, 0.004],
            [0.003, 0.006],
            [0, 0.006],           // H end
            [0, 0.008],           // U start
            [0.003, 0.008],
            [0.003, 0.010],
            [0, 0.010]            // U end
        ]
    }
];

/**
 * Scales and translates the relative points to absolute coordinates 
 * based on the runner's starting location.
 */
export function generateArtPath(startLat, startLng, shapeId) {
    const shape = ART_SHAPES.find(s => s.id === shapeId);
    if (!shape) return [];

    return shape.points.map(([dLat, dLng]) => [
        startLat + dLat,
        startLng + dLng
    ]);
}
