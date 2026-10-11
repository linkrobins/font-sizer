<?php

/*
 * This file is part of linkrobins/font-sizer.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace LinkRobins\FontSizer\Tests\integration;

use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;

/**
 * The extension is front-end only; its PHP side is the settings it sends to
 * the browser and the stylesheet the forum compiles. These run weekly against
 * the newest Flarum 2.x, so a core change that breaks either fails here first.
 */
class ForumTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();

        $this->extension('linkrobins-font-sizer');
    }

    /** @return array<string, mixed> */
    private function forumAttributes(): array
    {
        $response = $this->send($this->request('GET', '/api'));
        $this->assertEquals(200, $response->getStatusCode());

        return json_decode($response->getBody()->getContents(), true)['data']['attributes'];
    }

    #[Test]
    public function the_forum_page_loads_with_the_extension_enabled(): void
    {
        // Rendering the forum compiles the extension's JS and LESS into the
        // forum assets; a stylesheet that does not compile fails the page.
        $response = $this->send($this->request('GET', '/'));

        $this->assertEquals(200, $response->getStatusCode());
    }

    #[Test]
    public function the_defaults_reach_the_forum(): void
    {
        $a = $this->forumAttributes();

        $this->assertSame('100', $a['linkrobinsFontScale']);
        $this->assertSame('default', $a['linkrobinsFontSizerUi']);
        $this->assertSame('14', $a['linkrobinsFontSizerTextBase']);
        $this->assertSame('12', $a['linkrobinsFontSizerTextSmall']);
        $this->assertSame('16', $a['linkrobinsFontSizerTextTitle']);
    }

    /** @return array<string, array{string, string}> */
    public static function scales(): array
    {
        return [
            'in range' => ['120', '120'],
            'above the ceiling' => ['500', '150'],
            'below the floor' => ['50', '80'],
            // A garbled row must not shrink everyone's text to the floor.
            'not a number' => ['abc', '100'],
        ];
    }

    #[Test]
    #[DataProvider('scales')]
    public function the_scale_is_clamped_to_80_150(string $stored, string $sent): void
    {
        $this->setting('linkrobins-font-sizer.scale', $stored);

        $this->assertSame($sent, $this->forumAttributes()['linkrobinsFontScale']);
    }

    #[Test]
    public function the_ui_only_ever_sends_a_known_value(): void
    {
        $this->setting('linkrobins-font-sizer.ui', 'huge');
        $this->assertSame('default', $this->forumAttributes()['linkrobinsFontSizerUi']);
    }

    #[Test]
    public function the_large_ui_is_kept(): void
    {
        $this->setting('linkrobins-font-sizer.ui', 'large');
        $this->assertSame('large', $this->forumAttributes()['linkrobinsFontSizerUi']);
    }

    #[Test]
    public function the_text_sizes_are_clamped_to_10_32_px(): void
    {
        $this->setting('linkrobins-font-sizer.text_base', '100');
        $this->setting('linkrobins-font-sizer.text_small', '5');
        $this->setting('linkrobins-font-sizer.text_title', '20');

        $a = $this->forumAttributes();
        $this->assertSame('32', $a['linkrobinsFontSizerTextBase']);
        $this->assertSame('10', $a['linkrobinsFontSizerTextSmall']);
        $this->assertSame('20', $a['linkrobinsFontSizerTextTitle']);
    }
}
